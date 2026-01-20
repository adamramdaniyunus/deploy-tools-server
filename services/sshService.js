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
      const connectConfig = {
        host: this.config.host,
        username: this.config.username,
        port: this.config.port || 22,
      };

      if (this.config.password) {
        connectConfig.password = this.config.password;
      }

      if (this.config.privateKey && this.config.privateKey.trim() !== '') {
        let key = this.config.privateKey.trim();
        // Auto-fix: If key is missing headers but looks like an OpenSSH key (starts with 'openssh-key-v1' in base64)
        if (!key.startsWith('-----BEGIN') && key.startsWith('b3BlbnNzaC1rZXktdjE')) {
            key = `-----BEGIN OPENSSH PRIVATE KEY-----\n${key}\n-----END OPENSSH PRIVATE KEY-----`;
        }
        connectConfig.privateKey = key;
      }

      await this.ssh.connect(connectConfig);
      
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
