const express = require('express');
var passport = require('passport');
var Account = require('../models/account');
const authRouter = express.Router();

authRouter.get('/', function(req, res) {
    res.redirect('/auth/login');
});

authRouter.get('/register', function(req, res) {
    res.render('register', { user: req.user });
});

authRouter.post('/register', function(req, res) {
    let query = Account.findOne({ auth_id: req.body.auth_id });
    query.exec((err, result) => {
        if (result.registration_status == 'pending') {
            result.registration_status = 'complete';
            result.setPassword(req.body.password, () => {
                result.save();
            });
            res.redirect('/auth/login');
        } else {
            res.sendStatus(401);
            return;
        }
    });
});

authRouter.get('/login', function(req, res) {
    res.render('login', { user: req.user });
});

authRouter.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

authRouter.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = authRouter;