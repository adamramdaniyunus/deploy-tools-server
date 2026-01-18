const crypto = require('crypto');

const key = 'your-secret-key';
class Encrypt {
    constructor() {
        this.key = key;
    }

    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    decrypt(text) {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}


const encrypt = new Encrypt();

module.exports = encrypt;
