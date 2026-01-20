const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const encrypt = require('./utils/encrypt');
const { CredentialsProject } = require('./models');


const { v4: uuidv4 } = require('uuid');
dotenv.config();

const { sequelize, Project } = require('./models');
const { deployProject } = require('./services/deployService');
const SSHService = require('./services/sshService');

// Import routes
const toolsRoutes = require('./routes/tools');
const organizationsRoutes = require('./routes/organizations');
const projectTypesRoutes = require('./routes/project-types');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? '*' : process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Sync database with { alter: true } to update existing tables
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database synced successfully');
}).catch(err => {
  console.error('❌ Failed to sync database:', err);
});

// --- API Routes ---

// Mount routes
app.use('/api/tools', toolsRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/project-types', projectTypesRoutes);


// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const { 
      name, 
      type, 
      toolId,
      tools,
      host, 
      username, 
      password, 
      privateKey, 
      port, 
      deployPath,
      repoUrl,
      branch,
      gitToken,
      authMethod,
      buildCmd,
      startCmd,
      frontendBuildCmd,
      composerInstall,
      laravelOptimize,
      runMigrations,
      appPort, 
      domain,
      setupType,
      fullSetup
    } = req.body;

    const credentialsId = uuidv4();
    const projectId = uuidv4();

    // dummy user and organization
    const defaultUserId = '0ee4db14-1950-4383-b1c6-5ad364933f5a';
    const defaultOrgId = '0ff206fe-781e-4d7f-99e4-4c41a6416bb0';

    // Create credentials first (encrypt sensitive data)
    const credentialsData = {
      host,
      username,
      password,
      privateKey,
      port: port || 22,
      deployPath,
      repoUrl,
      branch: branch || 'main',
      gitToken,
      authMethod: authMethod || 'pat'
    };
    
    // Encrypt credentials using proper encryption
    const hashedCredentials = encrypt.encrypt(JSON.stringify(credentialsData));
    
    // Start transaction
    const t = await sequelize.transaction();

    let project;
    
    try {
      project = await Project.create({
        id: projectId,
        name: name || 'Untitled Project',
        organizationId: defaultOrgId,
        toolId: toolId || null,
        appPort: appPort || 3000,
        domain: domain || null,
        createdBy: defaultUserId,
        updatedBy: defaultUserId,
        credentialsId: null,
      }, { transaction: t });

      await CredentialsProject.create({
        id: credentialsId,
        projectId: projectId,
        hashedCredentials,
      }, { transaction: t });

      await project.update({ credentialsId: credentialsId }, { transaction: t });

      // Commit transaction
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    const projectWithDeployData = {
      ...project.toJSON(),
      credentialsId: credentialsId, // Ensure this is set in response
      type,
      tools: tools || [],
      host,
      username,
      password,
      privateKey,
      port: port || 22,
      deployPath,
      repoUrl,
      branch: branch || 'main',
      gitToken,
      authMethod: authMethod || 'pat',
      buildCmd,
      startCmd,
      frontendBuildCmd,
      composerInstall,
      laravelOptimize,
      runMigrations,
      setupType: setupType || 'app',
      fullSetup: setupType === 'full'
    };

    res.status(201).json(projectWithDeployData);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    await project.update(req.body);
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Connection
app.post('/api/test-connection', async (req, res) => {
  const { host, username, password, privateKey, port, socketId } = req.body;
  
  if (!host || !username) {
    return res.status(400).json({ error: 'Host and username are required' });
  }

  const logger = (message) => {
    if (socketId) {
      io.to(socketId).emit('log:test', { message, timestamp: new Date() });
    }
    console.log(`[TestConnection] ${message}`);
  };

  const ssh = new SSHService({
    host, username, password, privateKey, port
  }, logger);

  try {
    await ssh.connect();
    await ssh.exec('uname -a', { cwd: '/tmp' }); // Just runs a simple command
    await ssh.disconnect();
    res.json({ message: 'Connection successful' });
  } catch (error) {
    logger(`Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Deploy Action
app.post('/api/projects/:id/deploy', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Fetch and decrypt credentials
    let decryptedCredentials = {};
    if (project.credentialsId) {
      const creds = await CredentialsProject.findByPk(project.credentialsId);
      if (creds) {
         const decryptedString = encrypt.decrypt(creds.hashedCredentials);
         decryptedCredentials = JSON.parse(decryptedString);
      }
    }
    
    const fullProjectData = {
      ...project.toJSON(),
      ...decryptedCredentials
    };

    deployProject(fullProjectData, io).catch(err => console.error('Background deploy error:', err));
    
    res.json({ message: 'Deployment started', channel: `logs:${project.id}` });
  } catch (error) {
    console.error('Deploy request error:', error);
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
