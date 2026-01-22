const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  wrongPasswordCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastLoginIp: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  resetPasswordTokenExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  changePasswordAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  changePasswordIp: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});


// register user
User.register = async (user) => {

  const passwordHash = await bcrypt.hash(user.password, 10);

  const userData = {
    ...user,
    password: passwordHash
  }

  const newUser = await User.create(userData);
  return newUser;
}

User.login = async (requestData) => {
  const user = await User.findOne({ where: { email: requestData.email } });
  if (!user) return null;
  const isPasswordValid = await bcrypt.compare(requestData.password, user.password);
  if (!isPasswordValid) return null;

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }

  return userData;
}

module.exports = User;
