const express = require('express');
const passport = require('passport');
const Account = require('../models/account');
const authRouter = express.Router();
const fs = require('fs');
const config = require('../config.json');
var adminAuth = false;

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
            res.redirect('/auth/login');
        } else {
            res.sendStatus(401);
        }
    });
});

authRouter.get('/login', (req, res) => {
    res.render('auth/login', {user: req.user});
});

authRouter.post('/login', passport.authenticate('local'), (req, res) => {
    res.redirect('/');
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
    } else {
        res.sendStatus(401);
    }
});

authRouter.get('/admin2fa', (req, res) => {
    res.render('success');
});

module.exports.router = authRouter;

module.exports.verifyAdmin = () => {
    return adminAuth;
}