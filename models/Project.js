const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false, // nodejs, php, static, laravel-react
    defaultValue: 'nodejs'
  },
  // Server Credentials
  host: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
    // In a real production app, this should be encrypted. 
    // For a local tool, we'll keep it simple but treat it carefully.
  },
  port: {
    type: DataTypes.INTEGER,
    defaultValue: 22
  },
  deployPath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Git Configuration
  repoUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  branch: {
    type: DataTypes.STRING,
    defaultValue: 'main'
  },
  gitToken: {
    type: DataTypes.STRING,
    allowNull: true // Optional (if using SSH or public repo)
  },
  authMethod: {
    type: DataTypes.STRING,
    defaultValue: 'pat' // pat, ssh, none
  },
  // Build & Run Config
  buildCmd: {
    type: DataTypes.STRING,
    allowNull: true
  },
  frontendBuildCmd: {
    type: DataTypes.STRING, 
    defaultValue: 'npm run build'
  },
  startCmd: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Advanced Laravel Options
  composerInstall: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  laravelOptimize: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  runMigrations: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  appPort: {
    type: DataTypes.INTEGER,
    defaultValue: 3000
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Status tracking
  lastDeployedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastDeploymentStatus: {
    type: DataTypes.STRING, // success, failed
    allowNull: true
  }
});

module.exports = Project;
