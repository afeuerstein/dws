const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Vote = new Schema({
    title: String,
    description: String,
    creationDate: { type: Date, default: Date.now },
    date: {
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date}
    },
    isVoteRunning: {type: Boolean, default: false},
    votes: {
        yes: {type: Number, default: -1},
        no: {type: Number, default: -1},
        abstention: {type: Number, default: -1},
        accounts: []
    }
});

module.exports = mongoose.model('Vote', Vote);