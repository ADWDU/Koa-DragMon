const { Schema, model, Types } = require('mongoose');

const { cellSchema } = require('./Cell');
const generateCards = require('../utils/generateCards');
const ResponseError = require('./../ResponseError');

const cardSchema = new Schema({
    cells: [{
        _id: false,
        type: cellSchema,
        required: true
    }],
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    crossLine: [{ type: Number, required: true }],
    played: { type: Boolean, required: true, default: false }
});

cardSchema.index({ userId: 1, played: 1 });
cardSchema.pre('validate', function(next) {
    if (this.cells.length !== 9) {
        throw new ResponseError('There should be 9 cells in card', 500);
    }

    if (this.crossLine.length !== 3) {
        throw new ResponseError('There should be 3 cells on cross line', 500);
    }

    next();
});

class CardClass {
    static async createCards(session, cardsNumber, userId) {
        const generatedCards = generateCards(cardsNumber, userId);
        const savedCards = await this.insertMany(generatedCards, { session: session });
        return savedCards;
    }

    static async openCell(userId, cardId, cellIndex) {
        const card = await this.findById(cardId);
        if (!card) {
            throw new ResponseError('Card doest`t exist', 400);
        }

        if (card.userId.toString() !== userId) {
            throw new ResponseError('This card is not belonged to you', 400);
        }

        if (card.cells[cellIndex].opened) {
            throw new ResponseError('This cell already opened', 400);
        }

        card.cells[cellIndex].opened = true;

        await card.save();
    }

    static async endCard(endGameSession, cardId, userId) {
        const card = await this.findById(cardId).session(endGameSession);
        if (!card) {
            throw new ResponseError('Card doest`t exist', 400);
        }

        if (card.userId.toString() !== userId) {
            throw new ResponseError('This card is not belonged to you', 400);
        }

        if (card.played) {
            throw new ResponseError('This card already ended', 400);
        }

        const cardIncome = card.cells.reduce((accumulator, currectCell) => {
            currectCell.opened = true;
            return accumulator + currectCell.value;
        }, 0);

        card.played = true;
        await card.save();
        return cardIncome;
    }

    static async getNotPlayedCardId(endGameSession, userId) {
        const card = await this.findOne({ userId: userId, played: false }, '_id').session(endGameSession);
        return !card ? null : card._id;
    }
}

cardSchema.loadClass(CardClass);

module.exports = model('Card', cardSchema);
