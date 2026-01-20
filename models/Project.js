const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  branch: {
    type: DataTypes.STRING(32),
    allowNull: false,
    defaultValue: "main"
  },
  toolId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'list_tools_project',
      key: 'id'
    }
  },
  credentialsId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'credentials_projects',
      key: 'id'
    }
  },
  appPort: {
    type: DataTypes.INTEGER,
    defaultValue: 3000
  },
  domain: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  lastDeployedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastDeploymentStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['success', 'failed', 'pending', 'running']]
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'projects',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Project;
