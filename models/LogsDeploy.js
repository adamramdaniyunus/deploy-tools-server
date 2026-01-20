const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogsDeploy = sequelize.define('LogsDeploy', {
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
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['success', 'failed', 'pending', 'running']]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'logs_deplpoy',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = LogsDeploy;
