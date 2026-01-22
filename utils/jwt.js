const dotenv = require('dotenv');
dotenv.config();

const jwt = require('jsonwebtoken');


class JwtUtil {
    secretKey = process.env.JWT_SECRET;
    expiresIn = process.env.JWT_EXPIRES_IN || '30d' // 1 month
    constructor() {}    
    
    // generate token
    generateToken = (data) => {
        // Ensure payload is an object so expiresIn option works
        const payload = typeof data === 'object' && data !== null ? data : { id: data };
        const token = jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn });
        return token;
    }

    // verify token
    verifyToken = (token) => {
        const decoded = jwt.verify(token, this.secretKey);
        return decoded;
    }
}

const jwtUtil = new JwtUtil();

module.exports = jwtUtil;
