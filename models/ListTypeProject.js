const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ListTypeProject = sequelize.define('ListTypeProject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'nodejs, php, static, laravel-react'
  }
}, {
  tableName: 'list_type_project',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ListTypeProject;
