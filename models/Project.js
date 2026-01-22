const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const encrypt = require('../utils/encrypt');

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

// Static Methods

Project.getAll = function() {
  return this.findAll({
    order: [['created_at', 'DESC']]
  });
};

Project.getById = function(id) {
  return this.findByPk(id);
};

Project.createWithCredentials = async function(data) {
  const { 
    name, type, toolId, tools, host, username, password, privateKey, 
    port, deployPath, repoUrl, branch, gitToken, authMethod, 
    buildCmd, startCmd, frontendBuildCmd, composerInstall, 
    laravelOptimize, runMigrations, appPort, domain, setupType, fullSetup,
    defaultUserId, defaultOrgId 
  } = data;

  const credentialsId = uuidv4();
  const projectId = uuidv4();

  const credentialsData = {
    host,
    username,
    password,
    privateKey,
    port: port || 22,
    deployPath,
    repoUrl,
    branch: branch || 'main',
    gitToken,
    authMethod: authMethod || 'pat'
  };
  
  const hashedCredentials = encrypt.encrypt(JSON.stringify(credentialsData));
  
  const t = await sequelize.transaction();

  try {
    const CredentialsProject = sequelize.models.CredentialsProject;
    
    const project = await this.create({
      id: projectId,
      name: name || 'Untitled Project',
      organizationId: defaultOrgId,
      toolId: toolId || null,
      appPort: appPort || 3000,
      domain: domain || null,
      createdBy: defaultUserId,
      updatedBy: defaultUserId,
      credentialsId: null, // Allow null temporarily
      branch: branch || 'main'
    }, { transaction: t });

    await CredentialsProject.create({
      id: credentialsId,
      projectId: projectId,
      hashedCredentials,
    }, { transaction: t });

    await project.update({ credentialsId: credentialsId }, { transaction: t });

    await t.commit();

    // Prepare return data
    return {
      ...project.toJSON(),
      credentialsId: credentialsId,
      type, tools: tools || [], host, username, password, privateKey,
      port: port || 22, deployPath, repoUrl, branch: branch || 'main',
      gitToken, authMethod: authMethod || 'pat', buildCmd, startCmd,
      frontendBuildCmd, composerInstall, laravelOptimize, runMigrations,
      setupType: setupType || 'app', fullSetup: setupType === 'full'
    };

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

Project.updateById = async function(id, data) {
  const project = await this.findByPk(id);
  if (!project) throw new Error('Project not found');
  return await project.update(data);
};

Project.deleteById = async function(id) {
  const project = await this.findByPk(id);
  if (!project) throw new Error('Project not found');
  return await project.destroy();
};

Project.getWithDecryptedCredentials = async function(id) {
  const project = await this.findByPk(id);
  if (!project) return null;

  let decryptedCredentials = {};
  if (project.credentialsId) {
    const CredentialsProject = sequelize.models.CredentialsProject;
    const creds = await CredentialsProject.findByPk(project.credentialsId);
    
    if (creds) {
       const decryptedString = encrypt.decrypt(creds.hashedCredentials);
       decryptedCredentials = JSON.parse(decryptedString);
    }
  }

  return {
    ...project.toJSON(),
    ...decryptedCredentials
  };
};

module.exports = Project;
