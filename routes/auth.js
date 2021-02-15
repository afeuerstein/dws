const express = require('express');
const passport = require('passport');
const Account = require('../models/account');
const authRouter = express.Router();
const fs = require('fs');
const config = require('../config.json');
var adminAuth = false;
const tfaUtils = require('../util/2fa');
const tfa = require('2fa');

authRouter.get('/', function (req, res) {
    res.redirect('/auth/login');
});

authRouter.get('/register', function (req, res) {
    res.render('auth/register', {user: req.user});
});

authRouter.post('/register', (req, res) => {
    let query = Account.findOne({auth_id: req.body.auth_id});
    query.exec((err, result) => {
        if (!result) return res.sendStatus(401);
        if (result.registration_status === 'pending') {
            result.registration_status = 'complete';
            result.setPassword(req.body.password, () => {
                result.save();
            });
            req.body.username = result.username;
            req.logIn(result, (err) => {
                return res.redirect('/auth/2fa/setup');
            });
        } else {
            res.sendStatus(401);
        }
    });
});

authRouter.get('/login', (req, res) => {
    res.render('auth/login', {user: req.user});
});

authRouter.post('/login', passport.authenticate('local'), (req, res) => {
    if(!req.body.totp) return res.sendStatus(401);
    Account.find({username: req.body.username}, (err, docs) => {
        if (docs.length !== 1) return res.send('Etwas ist schiefgelaufen.');
        const user = docs[0];
        const isValid = tfaUtils.checkCode(user, req.body.totp);
        if (!isValid) {
            req.logout();
            return res.sendStatus(401);
        }
        res.redirect('/');
    });
});

authRouter.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

authRouter.get('/changepwd', (req, res) => {
    if (req.user) {
        res.render('auth/changepwd');
    } else res.redirect('/auth/login');
});

authRouter.post('/changepwd', (req, res, next) => {
    if (!req.user) {
        res.sendStatus(401);
        next();
    }
    if (req.body.new_password !== req.body.password_retype) {
        res.send('Passwörter stimmen nicht überein.');
        next();
    }
    req.user.changePassword(req.body.old_password, req.body.new_password);
    req.logout();
    res.render('success')
});

authRouter.post('/admin2fa', (req, res) => {
    if (!fs.existsSync("./token.txt")) {
        if (req.body.approve) {
            fs.writeFileSync("./token.txt", req.body.approve);
        } else if (req.body.dismiss) {
            fs.writeFileSync("./token.txt", req.body.dismiss);
        } else if (req.body.deactivate) {
            fs.writeFileSync("./token.txt", req.body.deactivate);
        }

    }
    token = fs.readFileSync("token.txt").toString();
    if (req.body.approve === token) {
        adminAuth = true;
        res.redirect(config.admin2faServer + '/timer');
    } else if (req.body.dismiss === token) {
        adminAuth = false;
        res.redirect(config.admin2faServer);
    } else if (req.body.deactivate === token) {
        Account.findOne({admin: true}).exec((err, account) => {
            if (!account) return res.send("Dieser Account wurde bereits deaktiviert.");
            account.delete();
            res.redirect(config.admin2faServer);
        });
    } else {
        res.sendStatus(401);
    }
});

authRouter.get('/2fa/setup', (req, res) => {
        if (!req.user) return res.redirect('/auth/login');
        if (req.user.tfa.active) return res.redirect('/auth/login');
        if (req.query.secret) {
            var key = req.query.secret;
            req.user.tfa.secret = key;
            req.user.save();
            tfa.generateGoogleQR('DWS', req.user.username, key, {}, (err, qr) => {
                res.render('auth/2fasetup', {
                    qr,
                    key: 'otpauth://totp/DWS:' + req.user.username + '?secret=' + key
                });
            });
        } else {
            tfa.generateKey(32, (err, key) => {
                return res.redirect('?secret=' + key);
            });
        }
    }
);

authRouter.post('/2fa/setup', (req, res) => {
    if (!req.user) return res.redirect('/auth/login');
    if (req.user.tfa.active) return res.redirect('/auth/login');
    if (!req.body.totp) return res.sendStatus(400);
    const isValid = tfaUtils.checkCode(req.user, req.body.totp);
    if (isValid) {
        req.user.tfa.active = true;
        req.user.save();
        res.redirect('/');
    } else {
        res.redirect('/auth/2fa/setup?secret=' + req.user.tfa.secret);
    }
});

module.exports.router = authRouter;

module.exports.verifyAdmin = () => {
    return adminAuth;
}