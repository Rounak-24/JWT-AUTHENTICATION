const jwt = require('jsonwebtoken');
require('dotenv').config();
const key = process.env.JWT_SECRET_KEY;

const generateToken = function (payload) {
    return jwt.sign({payload},key);
}

module.exports = generateToken;