var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    registration_status: { type: String, default: 'pending' },
    auth_id: String,
    admin: { type: Boolean, default: false },
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);