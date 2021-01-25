const Router = require('@koa/router');
const validation = require('koa-context-validator');
const config = require('config');
const User = require('../models/User');
const ResponseError = require('../ResponseError');
const bruteMiddleware = require('../middleware/brute.middleware');

const router = new Router();
const { Joi } = validation;
const validator = validation.default;

// api/signup
router.post(
    '/signup',
    validator({
        body: Joi.object().keys({
            login: Joi.string().required().min(3).max(15).error((() => new ResponseError('Login should min 3 max 15', 400))),
            password: Joi.string().required().min(6).max(20).error((() => new ResponseError('Password should min 3 max 15', 400))),
        })
    }),
    async (ctx) => {
        const { login, password } = ctx.request.body;
        await User.signUp(login, password);
        ctx.response.status = 201;
        ctx.response.body = { message: 'User is creted' };
    }
);

// api/signin
router.post(
    '/signin',
    bruteMiddleware,
    validator({
        body: Joi.object().keys({
            login: Joi.string().required().min(3).max(15).error((() => new ResponseError('Login should min 3 max 15', 400))),
            password: Joi.string().required().min(6).max(20).error((() => new ResponseError('Password should min 3 max 15', 400))),
        })
    }),
    async (ctx) => {
        const { login, password } = ctx.request.body;
        const token = await User.signIn(login, password);
        ctx.cookies.set('authcookie', token, { maxAge: config.get('ttlMs') });
        ctx.response.body = { message: 'Successfully authorized' };
    }
);

module.exports = router;