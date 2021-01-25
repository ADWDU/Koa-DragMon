const config = require('config');
const { Random } = require('random-js');

// ===========
// 0 | 1 | 2 |
// 3 | 4 | 5 |
// 6 | 7 | 8 |
// ===========
const crossLineTypes = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const cellValues = config.get('numbersUsedInCard');
const generateCards = function(cardsNumber, userId) {
    const cards = [];
    for (let i = 0; i < cardsNumber; i++) {
        cards.push(createCard(userId));
    }

    return cards;
};

const createCard = function(userId) {
    const random = new Random();
    const crossLine = crossLineTypes[random.integer(0, crossLineTypes.length)];
    const cells = [];
    const numberCellValues = cellValues.length - 1;
    for (let i = 0; i < 9; i++) {
        cells.push({
            value: cellValues[random.integer(0, numberCellValues)],
            opened: false
        });
    }

    // Setting the equal value for cells in cross line that taken from first cell - cells[crossLine[0]
    crossLine.forEach(crossLineIndex => cells[crossLineIndex] = cells[crossLine[0]]);
    const card = {
        crossLine,
        cells,
        userId
    };

    return card;
};

module.exports = generateCards;