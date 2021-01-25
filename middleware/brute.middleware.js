const config = require('config');
const mongoose = require('mongoose');
const RateLimit = require('koa2-ratelimit').RateLimit;
const Stores = require('koa2-ratelimit').Stores;

RateLimit.defaultOptions({
    message: 'Too many requests, please try again later.',
    store: new Stores.Mongodb(mongoose.connection, {
        collectionName: 'bruteRateRecords', // table to manage the middleware
        collectionAbuseName: 'bruteRateRecords2', // table to store the history of abuses in.
    }),
});

module.exports = RateLimit.middleware({
    interval: { ms: config.get('bruteTimeframeMs') },
    max: config.get('totalRequestInFrame'),
});
