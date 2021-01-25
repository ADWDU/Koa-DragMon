const { Schema } = require('mongoose');
const config = require('config');

const ResponseError = require('./../ResponseError');

const cellValues = config.get('numbersUsedInCard');

const cellSchema = new Schema({
    value: { type: Number, required: true, },
    opened: { type: Boolean, required: true, default: false }
});

cellSchema.pre('validate', function(next) {
    if (!cellValues.includes(this.value)) {
        throw new ResponseError('Cell has invalid value.', 500);
    }

    next();
});

module.exports.cellSchema = cellSchema;
