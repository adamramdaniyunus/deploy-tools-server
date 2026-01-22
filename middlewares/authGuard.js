
const dotenv = require('dotenv');
dotenv.config();

const jwtUtil = require('../utils/jwt');


class AuthGuard {
    constructor() {}
    middleware(req, res, next) {
       try {
           const token = req.headers.authorization.split(' ')[1];
           if (!token) return res.status(401).json({ error: 'Unauthorized' });
           
           const userData = jwtUtil.verifyToken(token);
           req.user = userData;
           next();
       } catch (error) {
           console.error('Auth Guard Error:', error.message);
           return res.status(401).json({ error: 'Unauthorized' });
       }
    }
}

const authGuard = new AuthGuard();

module.exports = authGuard.middleware;