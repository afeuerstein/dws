const express = require('express');
var passport = require('passport');
var Account = require('../models/account');
const authRouter = express.Router();

authRouter.get('/', function(req, res) {
    res.redirect('/auth/login');
});

authRouter.get('/register', function(req, res) {
    res.render('register', {});
});

authRouter.post('/register', function(req, res) {
    Account.register(new Account({ username: req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account: account });
        }

        passport.authenticate('local')(req, res, function() {
            res.redirect('/');
        });
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

authRouter.get('/ping', function(req, res) {
    res.status(200).send("pong!");
});


module.exports = authRouter;