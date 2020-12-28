const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArchivedVote = new Schema({
    title: String,
    description: String,
    creationDate: { type: Date },
    date: {
        startDate: { type: Date },
        endDate: { type: Date}
    },
    votes: {
        yes: Number,
        no: Number,
        abstention: Number,
    }
});

module.exports = mongoose.model('ArchivedVote', ArchivedVote);