const express = require('express');
var nav = require('../util/navigation').getNav("vote");
var Account = require('../models/account');
const voteRouter = express.Router();
const ArchivedVote = require('../models/archivedVote');

voteRouter.use((req, res, next) => {
    if (!req.user) {
        res.redirect('/auth/login');
    } else next();
});

voteRouter.get('/', (req, res) => res.redirect('/vote/dashboard'))

voteRouter.get('/dashboard', (req, res) => {
    res.render('vote/dashboard', {
        title: "Dashboard",
        nav,
        pagename: 'dashboard',
        user: req.user,
    });
});

voteRouter.get('/archive', (req,res) => {
    ArchivedVote.find({}).exec((err, result) => {
        if (err) throw err;
        res.render('vote/archive', {
            title: "Archiv",
            nav,
            pagename: 'archive',
            user: req.user,
            archive: result,
        });
    });
});

module.exports = voteRouter;