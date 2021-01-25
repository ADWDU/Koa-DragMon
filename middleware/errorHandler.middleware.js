module.exports = async function(ctx, next) {
    try {
        return await next();
    } catch (error) {
        if (!error.status) {
            error.status = 500;
        }

        if (!error.clientMessage) {
            error.clientMessage = 'Something went wrong.';
        }

        /* eslint-disable-next-line no-console */
        console.error(error);
        ctx.status = error.status;
        ctx.body = { message: error.clientMessage };
    }
};