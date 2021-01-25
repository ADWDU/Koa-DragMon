const Router = require('@koa/router');

const userRouter = require('./user.router');
const gameRouter = require('./game.router');
const balanceRouter = require('./balance.router');

const resultRouter = new Router();

resultRouter.use('/api', userRouter.routes(), userRouter.allowedMethods());
resultRouter.use('/api/game', gameRouter.routes(), gameRouter.allowedMethods());
resultRouter.use('/api/balance', balanceRouter.routes(), balanceRouter.allowedMethods());

module.exports = resultRouter;