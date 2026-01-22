const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require("socket.io");
const dotenv = require('dotenv');
dotenv.config();

const { sequelize } = require('./models');

// Import routes
const toolsRoutes = require('./routes/tools');
const organizationsRoutes = require('./routes/organizations');
const projectTypesRoutes = require('./routes/project-types');
const projectsRoutes = require('./routes/projects');
const projectController = require('./controllers/projectController');
const usersRoutes = require('./routes/users');

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

// Middleware to expose io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

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
app.use('/api/projects', projectsRoutes);
app.use('/api/users', usersRoutes);

// Standalone actions
app.post('/api/test-connection', projectController.testConnection);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
