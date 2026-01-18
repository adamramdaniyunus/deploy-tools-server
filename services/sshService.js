const { NodeSSH } = require('node-ssh');

class SSHService {
  constructor(config, logger) {
    this.config = config;
    this.ssh = new NodeSSH();
    this.connected = false;
    this.logger = logger || console.log;
  }

  log(message) {
    if (typeof this.logger === 'function') {
      this.logger(message);
    }
  }

  async connect() {
    if (this.connected) return;

    this.log(`Connecting to ${this.config.host}...`);
    
    try {
      await this.ssh.connect({
        host: this.config.host,
        username: this.config.username,
        password: this.config.password,
        privateKey: this.config.privateKey,
        port: this.config.port || 22,
      });
      
      this.connected = true;
      this.log('Connected to server');
    } catch (error) {
      this.log(`Failed to connect: ${error.message}`);
      throw error;
    }
  }

  async disconnect() {
    if (this.connected) {
      this.ssh.dispose();
      this.connected = false;
      this.log('Disconnected from server');
    }
  }

  async exec(command, options = {}) {
    await this.connect();
    
    this.log(`> ${command}`);
    
    const result = await this.ssh.execCommand(command, {
      cwd: options.cwd || this.config.deployPath,
      ...options
    });

    if (result.stdout) {
      this.log(result.stdout);
    }

    if (result.code !== 0 && !options.ignoreErrors) {
      if (result.stderr) this.log(`❌ Error: ${result.stderr}`);
      throw new Error(`Command failed: ${result.stderr || result.stdout}`);
    }
    
    return result;
  }
}

module.exports = SSHService;
