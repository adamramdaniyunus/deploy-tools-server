const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Organization = require('./Organization');
const OrganizationMember = require('./OrganizationMember');
const Project = require('./Project');
const CredentialsProject = require('./CredentialsProject');
const ListToolsProject = require('./ListToolsProject');
const ListTypeProject = require('./ListTypeProject');
const LogsDeploy = require('./LogsDeploy');

// Define relationships

// Organization <-> User (through OrganizationMember)
Organization.belongsToMany(User, {
  through: OrganizationMember,
  foreignKey: 'organizationId',
  as: 'members'
});

User.belongsToMany(Organization, {
  through: OrganizationMember,
  foreignKey: 'userId',
  as: 'organizations'
});

// Organization -> Projects
Organization.hasMany(Project, {
  foreignKey: 'organizationId',
  as: 'projects'
});

Project.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'organization'
});

// Project -> Tool
Project.belongsTo(ListToolsProject, {
  foreignKey: 'toolId',
  as: 'tool'
});

ListToolsProject.hasMany(Project, {
  foreignKey: 'toolId',
  as: 'projects'
});

// Project -> Credentials
Project.belongsTo(CredentialsProject, {
  foreignKey: 'credentialsId',
  as: 'credentials'
});

CredentialsProject.hasOne(Project, {
  foreignKey: 'credentialsId',
  as: 'project'
});

// Project -> Logs
Project.hasMany(LogsDeploy, {
  foreignKey: 'projectId',
  as: 'logs'
});

LogsDeploy.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project'
});

// User -> Projects (createdBy, updatedBy)
User.hasMany(Project, {
  foreignKey: 'createdBy',
  as: 'createdProjects'
});

User.hasMany(Project, {
  foreignKey: 'updatedBy',
  as: 'updatedProjects'
});

Project.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

Project.belongsTo(User, {
  foreignKey: 'updatedBy',
  as: 'updater'
});

module.exports = {
  sequelize,
  User,
  Organization,
  OrganizationMember,
  Project,
  CredentialsProject,
  ListToolsProject,
  ListTypeProject,
  LogsDeploy
};
