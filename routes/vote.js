const express = require('express');
const nav = require('../util/navigation').getNav("vote");
var Account = require('../models/account');
const voteRouter = express.Router();

voteRouter.use((req, res, next) => {
    if (!req.user) {
        res.redirect('/auth/login');
    } else next();
});

voteRouter.get('/', (req, res) => res.redirect('/vote/dashboard'))

voteRouter.get('/dashboard', (req, res) => {
    res.render('vote/dashboard', {
        title: nav.title,
        nav,
        pagename: 'dashboard'
    });
});

module.exports = voteRouter;