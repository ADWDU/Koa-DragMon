const mongoose = require('mongoose');
const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Card = require('./Card');
const ResponseError = require('./../ResponseError');

const { Schema, model, Types } = mongoose;

const userSchema = new Schema({
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, required: true, default: 0 },
    activeCard: { type: Types.ObjectId, ref: 'Card', default: null },
    cardsRemaining: { type: Number, required: true, default: 0 }
});

userSchema.index({ login: 1 });
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.password;
    }
});

class UserClass {
    static async getUserById(id, session) {
        let user;
        if (session) {
            user = await this.findById(id).session(session);
        } else {
            user = await this.findById(id);
        }

        if (!user) {
            throw new ResponseError('User is not found', 400);
        }

        return user;
    }

    static async signUp(login, password) {
        const candidate = await this.findOne({ login });

        if (candidate) {
            throw new ResponseError('User with that login already exist', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ login, password: hashedPassword, balance: 5000 });

        await user.save();
    }

    static async signIn(login, password) {
        const user = await this.findOne({ login });

        if (!user) {
            throw new ResponseError('There is no user with that login', 400);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new ResponseError('Password is incorrect, please try another one', 400);
        }

        return jwt.sign(
            { userId: user.id },
            config.get('jwtSecret'),
            { expiresIn: config.get('ttlMs') }
        );
    }

    static async getBalance(id) {
        const user = await this.getUserById(id);
        return user.balance;
    }

    static async increaseBalance(id, amount) {
        const user = await this.getUserById(id);

        user.balance += amount;
        user.save();
        return user.balance;
    }

    static async decreaseBalance(id, amount) {
        const user = await this.getUserById(id);

        user.balance -= amount;
        user.save();
        return user.balance;
    }

    static async purchaseCards(userId, cardsNumber) {
        const purchaseSession = await mongoose.startSession();
        purchaseSession.startTransaction();
        const user = await this.getUserById(userId, purchaseSession);

        if (user.balance < cardsNumber * config.get('cardCost')) {
            throw new ResponseError('User doesn`t have enough credits to purchase card.', 400);
        }

        const createdCards = await Card.createCards(purchaseSession, cardsNumber, userId);
        user.balance -= cardsNumber * config.get('cardCost');
        user.cardsRemaining += cardsNumber;
        if (!user.activeCard) {
            user.activeCard = createdCards[0]._id;
        }

        await user.save();

        await purchaseSession.commitTransaction();
        purchaseSession.endSession();
    }

    static async getState(userId) {
        const user = await this.findById(userId, 'activeCard cardsRemaining').populate({ path: 'activeCard', select: 'cells crossLine' });
        if (!user) {
            throw new ResponseError('User is not found by id', 400);
        }

        return user;
    }

    static async openCell(userId, cardId, cellIndex) {
        const user = await this.getUserById(userId);
        if (user.activeCard && user.activeCard.toString() !== cardId) {
            throw new ResponseError('This is not a current card of user', 400);
        }

        await Card.openCell(userId, cardId, cellIndex);
    }

    static async endGame(userId, cardId) {
        const endGameSession = await mongoose.startSession();
        endGameSession.startTransaction();
        const user = await this.getUserById(userId, endGameSession);

        const cardIncome = await Card.endCard(endGameSession, cardId, userId);

        user.cardsRemaining--;
        user.balance += cardIncome;

        user.activeCard = await Card.getNotPlayedCardId(endGameSession, userId);
        await user.save();

        await endGameSession.commitTransaction();
        endGameSession.endSession();
    }
}

userSchema.loadClass(UserClass);
const User = model('User', userSchema);

module.exports = User;
