module.exports = class ResponseError extends Error {
    constructor(clientMessage, status) {
        super(clientMessage);
        this.clientMessage = clientMessage;
        this.status = status;
    }
};