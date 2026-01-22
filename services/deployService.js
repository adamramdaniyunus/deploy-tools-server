const SSHService = require('./sshService');
const { Project, LogsDeploy } = require('../models');
const createSocketLogger = require('../utils/socketLogger');
const logger = require('../utils/logger');

/**
 * Function for deploy project
 * @param {object} project - Project object
 * @param {object} io - Socket.IO instance
 */

async function deployProject(project, io) {
  const date = Date.now();
  const jobId = `job_${date}`;
  const logChannel = `logs:${project.id}`;

  // Use reusable socket logger
  const log = createSocketLogger(io, logChannel, jobId);

  // Create initial log record
  let deployLog;
  try {
    deployLog = await LogsDeploy.create({
      projectId: project.id,
      status: 'running',
      message: 'Deployment started'
    });
  } catch (err) {
    logger(jobId, 'Failed to create deployment log:', err);
  }

 try {
  log(`Starting deployment for ${project.name}...`);

  const ssh = new SSHService({
    host: project.host,
    username: project.username,
    privateKey: project.privateKey,
    port: project.port,
    deployPath: project.deployPath
  }, log);

  await ssh.connect();

  log('Verifying local git status...');

  log('Pulling latest changes from git...');
  await ssh.exec(`git pull origin ${project.branch || 'main'}`);

  const commitResult = await ssh.exec('git log -1 --pretty=format:"%h - %s (%an)"', { ignoreErrors: true });

  log('----------------------------------------');
  log(`DEPLOYING COMMIT: ${commitResult.stdout.trim()}`);
  log('----------------------------------------');

  // if project full setup
  if (project.fullSetup) {
    log('Installing full setup...');

    const tools = project.tools || [];
    
    // Define tool installation commands
    const toolInstallations = {
      'nginx': {
        name: 'NGINX',
        command: 'apt-get update && apt-get install -y nginx'
      },
      'mysql': {
        name: 'MySQL',
        command: 'apt-get update && apt-get install -y mysql-server'
      },
      'php': {
        name: 'PHP',
        command: 'apt-get update && apt-get install -y php-fpm'
      },
      'nodejs': {
        name: 'Node.js',
        command: 'apt-get update && apt-get install -y nodejs npm'
      },
      'composer': {
        name: 'Composer',
        command: 'curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer'
      },
      'git': {
        name: 'Git',
        command: 'apt-get update && apt-get install -y git'
      },
      'pm2': {
        name: 'PM2',
        command: 'npm install -g pm2'
      },
      'firewall': {
        name: 'UFW Firewall',
        command: 'apt-get update && apt-get install -y ufw'
      },
      'ufw': {
        name: 'UFW',
        command: 'apt-get update && apt-get install -y ufw'
      }
    };

    // Install tools based on project configuration
    for (const tool of tools) {
      if (toolInstallations[tool]) {
        log(`Installing ${toolInstallations[tool].name}...`);
        await ssh.exec(toolInstallations[tool].command);
      }
    }
  }

  // Deploy based on project type
  if (project.type === 'nodejs') {
    log('Installing Node.js dependencies...');
    await ssh.exec('npm install --production');

    if (project.buildCmd) {
      log('Running build command...');
      await ssh.exec(project.buildCmd);
    }

    if (project.startCmd) {
      log('Restarting application...');
      const appName = project.name.replace(/\s+/g, '-').toLowerCase();

      let pm2Cmd = "";
      if (project.startCmd.startsWith('npm')) {
        const script = project.startCmd.replace('npm ', '').replace('run ', '');
        pm2Cmd = `pm2 restart ${appName} || pm2 start npm --name "${appName}" -- run ${script}`;
      } else {
        pm2Cmd = `pm2 restart ${appName} || pm2 start ${project.startCmd} --name "${appName}"`;
      }

      await ssh.exec(`${pm2Cmd} && pm2 save`);
    }
  }  
  
  if (project.type === 'laravel-react' || project.type === 'php') {
    log('Starting PHP / Laravel Deployment...');

    if (project.type === 'laravel-react') {
      log('Installing frontend dependencies...');
      await ssh.exec('npm install');

      log('Building frontend...');
      const buildCmd = project.frontendBuildCmd || 'npm run build';
      await ssh.exec(buildCmd);
    }

    if (project.composerInstall !== false) {
      log('Installing Composer dependencies...');
      await ssh.exec('composer install --no-dev --optimize-autoloader');
    }

    if (project.runMigrations) {
      log('Running migrations...');
      await ssh.exec('php artisan migrate --force');
    }

    if (project.laravelOptimize !== false) {
      log('Optimizing Laravel...');
      await ssh.exec('php artisan config:cache && php artisan route:cache && php artisan view:cache');
    }

    log('Reloading PHP-FPM...');
    await ssh.exec('systemctl reload php-fpm || true');
  }

  await ssh.disconnect();

  log('Deployment completed successfully!');
  io.emit(`status:${project.id}`, { status: 'success', lastDeployedAt: new Date() });

  // Update DB
  const projectInstance = await Project.findByPk(project.id);

  await projectInstance.update({
    lastDeploymentStatus: 'success',
    lastDeployedAt: new Date()
  });

  // Update History Log to Success
  if (deployLog) {
    await deployLog.update({
      status: 'success',
      message: 'Deployment completed successfully'
    });
  }

  return { status: 'success', lastDeployedAt: new Date() };
 } catch (error) {
  console.log(error);
  
  if (io) {
      io.emit(`logs:${project.id}`, { 
          message: `Deployment failed: ${error.message}`, 
          timestamp: new Date() 
      });
  }
  log(`Deployment failed: ${error.message}`);
  
  if (io) {
      io.emit(`status:${project.id}`, { status: 'failed' });
  }
  
  // Update DB to failed status
  const projectInstance = await Project.findByPk(project.id);
  if (projectInstance) {
    await projectInstance.update({
      lastDeploymentStatus: 'failed'
    });
  }

  // Update History Log to Failed
  if (deployLog) {
    await deployLog.update({
      status: 'failed',
      message: `Deployment failed: ${error.message}`
    });
  }

  throw error;
 }   
}


module.exports = { deployProject };
