const SSHService = require('./sshService');

async function deployProject(project, io) {
  const jobId = `job_${Date.now()}`;
  const logChannel = `logs:${project.id}`;
  
  const logger = (message) => {
    console.log(`[Job ${jobId}]`, message);
    io.emit(logChannel, { message, timestamp: new Date() });
  };

  logger(`Starting deployment for ${project.name}...`);

  try {
    // connect to server
    const ssh = new SSHService({
      host: project.host,
      username: project.username,
      password: project.password,
      port: project.port,
      deployPath: project.deployPath
    }, logger);

    await ssh.connect();

    logger('Verifying local git status...');
    
    logger('Pulling latest changes from git...');
    await ssh.exec(`git pull origin ${project.branch || 'main'}`);

    const commitResult = await ssh.exec('git log -1 --pretty=format:"%h - %s (%an)"', { ignoreErrors: true });
    
    logger('----------------------------------------');
    logger(`DEPLOYING COMMIT: ${commitResult.stdout.trim()}`);
    logger('----------------------------------------');

    if (project.type === 'nodejs') {
      logger('Installing Node.js dependencies...');
      await ssh.exec('npm install --production');

      if (project.buildCmd) {
        logger('Running build command...');
        await ssh.exec(project.buildCmd);
      }

      if (project.startCmd) {
        logger('Restarting application...');
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

    } else if (project.type === 'laravel-react' || project.type === 'php') { 
        logger('Starting PHP / Laravel Deployment...');
        
        if (project.type === 'laravel-react') {
            logger('Installing frontend dependencies...');
            await ssh.exec('npm install');
            
            logger('Building frontend...');
            const buildCmd = project.frontendBuildCmd || 'npm run build';
            await ssh.exec(buildCmd);
        }

        if (project.composerInstall !== false) {
            logger('Installing Composer dependencies...');
            await ssh.exec('composer install --no-dev --optimize-autoloader');
        }

        if (project.runMigrations) {
            logger('Running migrations...');
            await ssh.exec('php artisan migrate --force');
        }

        if (project.laravelOptimize !== false) {
             logger('Optimizing Laravel...');
             await ssh.exec('php artisan config:cache && php artisan route:cache && php artisan view:cache');
        }
        
        logger('Reloading PHP-FPM...');
        await ssh.exec('systemctl reload php-fpm || true');
    }

    await ssh.disconnect();
    
    logger('Deployment completed successfully!');
    io.emit(`status:${project.id}`, { status: 'success', lastDeployedAt: new Date() });

    // Update DB
    await project.update({ 
        lastDeploymentStatus: 'success',
        lastDeployedAt: new Date() 
    });

  } catch (error) {
    logger(`Deployment failed: ${error.message}`);
    io.emit(`status:${project.id}`, { status: 'failed' });
    
    await project.update({ 
        lastDeploymentStatus: 'failed',
        lastDeployedAt: new Date() 
    });
  }
}

module.exports = { deployProject };
