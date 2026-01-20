const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ListToolsProject = sequelize.define('ListToolsProject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'docker, nginx, nodejs, php, static, laravel-react'
  },
  version: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  buildCommand: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'JSON object containing build commands like {"build": "npm run build", "start": "npm run start"}'
  }
}, {
  tableName: 'list_tools_project',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ListToolsProject;
