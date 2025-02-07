const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assuming you have a User model

const register = async (userData) => {
    try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = new User({
            username: userData.username,
            email: userData.email,
            password: hashedPassword
        });
        await newUser.save();
        return { message: 'User registered successfully' };
    } catch (error) {
        throw new Error('Error registering user: ' + error.message);
    }
};

const login = async (userData) => {
    try {
        const user = await User.findOne({ where: { email: userData.email } }); 
        if (!user) {
            throw new Error('User not found');
        }
        const isPasswordValid = await bcrypt.compare(userData.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        return { message: 'Login successful', token: token };
    } catch (error) {
        throw new Error('Error logging in: ' + error.message);
    }
};

module.exports = {
    register,
    login
};