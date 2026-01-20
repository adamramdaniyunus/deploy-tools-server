const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const key = process.env.ENCRYPTION_KEY || 'secret-key-1234567890';
class Encrypt {
    constructor() {
        // Ensure key is 32 bytes for aes-256-cbc by hashing it
        this.key = crypto.createHash('sha256').update(key).digest();
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
