const tfa = require('2fa');
const Account = require('../models/account');

//generates a new key
module.exports.generateSecret = (id) => {
    tfa.generateKey(32,(err, key) => {
        Account.findById(id, (err, account) => {
            account.tfa.secret = key;
            account.save();
        });
    });
};

//valodates a totp code
module.exports.checkCode = (user, code) => {
    return tfa.verifyTOTP(user.tfa.secret, code);
};