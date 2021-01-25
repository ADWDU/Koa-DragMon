const Koa = require('koa');
const config = require('config');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const router = require('./api');
const errorHandler = require('./middleware/errorHandler.middleware');

const app = new Koa();

// Use error handler before using all routes
app.use(errorHandler);
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

const port = config.get('port') || 5000;

async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            autoCreate: true,
        });

        /* eslint-disable-next-line no-console */
        app.listen(port, () => console.log(`koa started on port ${port}...`));
    } catch (e) {
        /* eslint-disable-next-line no-console */
        console.log(`error while connected to mongoose. Message: ${e.message}`);
        /* eslint-disable-next-line no-undef */
        process.exit(1);
    }
}

start();
