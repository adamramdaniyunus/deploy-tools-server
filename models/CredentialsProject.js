const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CredentialsProject = sequelize.define('CredentialsProject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  hashedCredentials: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Encrypted credentials include host, username, password, privateKey, port, deployPath'
  }
}, {
  tableName: 'credentials_projects',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CredentialsProject;
