const Router = require('@koa/router');
const validation = require('koa-context-validator');

const ResponseError = require('../ResponseError');
const User = require('../models/User');
const auth = require('../middleware/auth.middleware');

const router = new Router();
const { Joi } = validation;
const validator = validation.default;

// api/game/state
router.get(
    '/state',
    auth,
    async (ctx) => {
        const { userId } = ctx.request.user;
        const userState = await User.getState(userId);
        ctx.body = userState;
    }
);

// api/game
router.post(
    '/',
    validator({
        body: Joi.object().keys({
            count: Joi.number().integer().required().min(1).max(10)
                .error((() => new ResponseError('The number of card should be minimum 1 and maximum 10', 400))),
        })
    }),
    auth,
    async (ctx) => {
        const { count } = ctx.request.body;
        const { userId } = ctx.request.user;
        await User.purchaseCards(userId, count);
        ctx.status = 201;
        ctx.body = { message: 'Cards are purchased.' };
    }
);

// api/game/cell
router.post(
    '/cell',
    validator({
        body: Joi.object().keys({
            cell: Joi.number().integer().required().min(0).max(8)
                .error((() => new ResponseError('Incorrect index of opening cell', 400))),
            id: Joi.required()
                .error((() => new ResponseError('You should pass card id', 400))),
        })
    }),
    auth,
    async (ctx) => {
        const { id, cell } = ctx.request.body;
        const { userId } = ctx.request.user;
        await User.openCell(userId, id, cell);
        ctx.body = ({ message: 'Cell is opened.' });
    }
);

// api/game/end
router.post(
    '/end',
    validator({
        body: Joi.object().keys({
            id: Joi.required()
                .error((() => new ResponseError('You should pass card id', 400))),
        })
    }),
    auth,
    async (ctx) => {
        const { id } = ctx.request.body;
        const { userId } = ctx.request.user;
        await User.endGame(userId, id);
        ctx.body = { message: 'Game is ended' };
    }
);

module.exports = router;