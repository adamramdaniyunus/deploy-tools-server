const { User } = require("../models");
const jwtUtil = require("../utils/jwt");


class UserController {
    constructor() {}

    register = async (req, res) => {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const user = await User.register({ name, email, password });
        res.status(201).json({ user, success: true });
    }

    login = async (req, res) => {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.login({ email, password });
        // generate token with user id only
        const token = jwtUtil.generateToken(user.id);
        res.status(200).json({ user, token, success: true });
    }

    getUser = async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id);
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

const userController = new UserController();

module.exports = userController;