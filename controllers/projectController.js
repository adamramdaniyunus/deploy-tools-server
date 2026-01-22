const { Project, LogsDeploy } = require('../models');
const SSHService = require('../services/sshService');
const { deployProject: runDeploy } = require('../services/deployService');

class ProjectController {
  // Get all projects
  getAllProjects = async (req, res) => {
    try {
      const projects = await Project.getAll();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get project by ID
  getProjectById = async (req, res) => {
    try {
      const project = await Project.getById(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new project
  createProject = async (req, res) => {
    try {
      // dummy user and organization (TODO: Replace with actual auth)
      const defaultUserId = '0ee4db14-1950-4383-b1c6-5ad364933f5a';
      const defaultOrgId = '0ff206fe-781e-4d7f-99e4-4c41a6416bb0';

      const projectData = {
        ...req.body,
        defaultUserId,
        defaultOrgId
      };

      const projectWithDeployData = await Project.createWithCredentials(projectData);
      res.status(201).json(projectWithDeployData);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Update project
  updateProject = async (req, res) => {
    try {
      const project = await Project.updateById(req.params.id, req.body);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete project
  deleteProject = async (req, res) => {
    try {
      await Project.deleteById(req.params.id);
      res.json({ message: 'Project deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Test Connection
  testConnection = async (req, res) => {
    const { host, username, password, privateKey, port, socketId } = req.body;
    const io = req.io; // Get IO from request
    
    if (!host || !username) {
      return res.status(400).json({ error: 'Host and username are required' });
    }

    const logger = (message) => {
      if (socketId && io) {
        io.to(socketId).emit('log:test', { message, timestamp: new Date() });
      }
      console.log(`[TestConnection] ${message}`);
    };

    const ssh = new SSHService({
      host, username, password, privateKey, port
    }, logger);

    try {
      await ssh.connect();
      await ssh.exec('uname -a', { cwd: '/tmp' });
      await ssh.disconnect();
      res.json({ message: 'Connection successful' });
    } catch (error) {
      logger(`Error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  // Deploy Project
  deployProject = async (req, res) => {
    try {
      const fullProjectData = await Project.getWithDecryptedCredentials(req.params.id);
      if (!fullProjectData) return res.status(404).json({ error: 'Project not found' });

      // Check if project has required deployment data
      if (!fullProjectData.host || !fullProjectData.username) {
        return res.status(400).json({ error: 'Missing deployment credentials' });
      }

      const io = req.io; // Get IO from request
      runDeploy(fullProjectData, io).catch(err => console.error('Background deploy error:', err));
      
      res.json({ message: 'Deployment started', channel: `logs:${fullProjectData.id}` });
    } catch (error) {
      console.error('Deploy request error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // History Deploy
  getHistoryDeploy = async (req, res) => {
    try {
      const logs = await LogsDeploy.getHistoryByProject(req.params.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get System Info (Terminal Check)
  getSystemInfo = async (req, res) => {
    try {
      const project = await Project.getWithDecryptedCredentials(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      
      const io = req.io;
      const logChannel = `logs:${project.id}`;
      
      const log = (msg) => {
        if (io) io.emit(logChannel, { message: msg, timestamp: new Date() });
      };

      // Run in background
      (async () => {
        try {
          const ssh = new SSHService({
            host: project.host,
            username: project.username,
            privateKey: project.privateKey,
            port: project.port,
            deployPath: project.deployPath
          }, log);

          await ssh.connect();
          await ssh.exec('echo "--- REMOTE TERMINAL SESSION ---"', { ignoreErrors: true });
          await ssh.exec('whoami && hostname && uptime', { ignoreErrors: true });
          await ssh.exec('df -h | grep -v "loop"', { ignoreErrors: true });
          await ssh.exec('echo "---------------------------------"', { ignoreErrors: true });
          await ssh.disconnect();
        } catch (error) {
           log(`Terminal checks failed: ${error.message}`);
        }
      })();

      res.json({ message: 'Terminal check initiated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Execute Command
  executeCommand = async (req, res) => {
    try {
      const { command } = req.body;
      if (!command) return res.status(400).json({ error: 'Command is required' });

      const project = await Project.getWithDecryptedCredentials(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      
      const io = req.io;
      const logChannel = `logs:${project.id}`;
      
      const log = (msg) => {
        if (io) io.emit(logChannel, { message: msg, timestamp: new Date() });
      };

      // Run in background to avoid timeout
      (async () => {
        try {
          const ssh = new SSHService({
            host: project.host,
            username: project.username,
            privateKey: project.privateKey,
            port: project.port,
            deployPath: project.deployPath
          }, log);

          // Log command input
          log(`$ ${command}`);

          await ssh.connect();
          await ssh.exec(command);
          await ssh.disconnect();
        } catch (error) {
          console.log(error);
          log(`Command failed: ${error.message}`);
        }
      })();

      res.json({ message: 'Command queued' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
};

const projectController = new ProjectController();

module.exports = projectController;
