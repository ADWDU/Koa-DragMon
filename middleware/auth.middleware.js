const jwt = require('jsonwebtoken');
const config = require('config');

const ResponseError = require('./../ResponseError');

module.exports = async (ctx, next) => {
    if (ctx.request.method === 'OPTIONS') {
        return next();
    }

    try {
        const authCookie = ctx.cookies.get('authcookie') ;
        if (!authCookie) {
            throw new ResponseError('Not authorized', 401);
        }

        const decoded = jwt.verify(authCookie, config.get('jwtSecret'));
        ctx.request.user = decoded;
        return next();
    } catch (e) {
        throw new ResponseError('Bad token', 401);
    }
};