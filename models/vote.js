const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Vote = new Schema({
    title: String,
    description: String,
    creationDate: { type: Date, default: Date.now },
    targetDate: {type: Date},
    timeInterval: {type: Date},
    isVoteRunning: {type: Boolean, default: false},
    votes: {
        yes: {type: Number, default: -1},
        no: {type: Number, default: -1},
        abstention: {type: Number, default: -1},
    }
});

module.exports = mongoose.model('Vote', Vote);