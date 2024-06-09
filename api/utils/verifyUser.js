const jwt = require('jsonwebtoken');
const errorHandler = require('./error.js');

const JWT_SECRET = "123123123";

module.exports = verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return next(errorHandler(401, 'Не авторизован'));
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return next(errorHandler(401, 'Не авторизован'));
        }
        req.user = user;
        next();
    });
};
