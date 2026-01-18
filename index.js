const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require("socket.io");

const sequelize = require('./config/database');
const Project = require('./models/Project');
const { deployProject } = require('./services/deployService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

sequelize.sync().then(() => {
  console.log('Database synced successfully');
}).catch(err => {
  console.error('Failed to sync database:', err);
});

// --- API Routes ---

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
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
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

// Deploy Action
app.post('/api/projects/:id/deploy', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    deployProject(project, io).catch(err => console.error('Background deploy error:', err));
    
    res.json({ message: 'Deployment started', channel: `logs:${project.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
