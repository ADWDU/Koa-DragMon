const Router = require('@koa/router');
const validation = require('koa-context-validator');

const ResponseError = require('../ResponseError');
const User = require('../models/User');
const auth = require('../middleware/auth.middleware');

const router = new Router();
const { Joi } = validation;
const validator = validation.default;

// api/balance
router.get(
    '/',
    auth,
    async (ctx) => {
        const balance = await User.getBalance(ctx.request.user.userId);
        ctx.body = ({ balance: balance });
    }
);

// api/balance/increase
router.post(
    '/increase',
    validator({
        body: Joi.object().keys({
            amount: Joi.number().integer().required().min(3).max(5000)
                .error((() => new ResponseError('Amount should be integer minimum 1 and maximum 5000', 400))),
        })
    }),
    auth,
    async (ctx) => {
        const { amount } = ctx.request.body;
        const { userId } = ctx.request.user;
        const balance = await User.increaseBalance(userId, amount);
        ctx.body = ({ balance });
    }
);

// api/balance/decrease
router.post(
    '/decrease',
    validator({
        body: Joi.object().keys({
            amount: Joi.number().integer().required().min(3).max(5000)
                .error((() => new ResponseError('Amount should be integerminimum 1 and maximum 5000', 400))),
        })
    }),
    auth,
    async (ctx) => {
        const { amount } = ctx.request.body;
        const { userId } = ctx.request.user;
        const balance = await User.decreaseBalance(userId, amount);
        ctx.body = ({ balance });
    }
);

module.exports = router;