const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'organizations',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Organization;
