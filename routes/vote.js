const express = require('express');
var nav = require('../util/navigation').getNav("vote");
var Account = require('../models/account');
const voteRouter = express.Router();
const Vote = require('../models/vote');
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

voteRouter.get('/list', (req, res) => {
    Vote.find({}).exec((err, result) => {
        if (err) throw err;
        res.render('vote/list', {
            title: 'Abstimmungen',
            nav,
            votes: result,
            pagename: 'list',
            user: req.user,
        });
    })
});

voteRouter.get('/submit/:voteID', (req, res) => {
    Vote.findById(req.params.voteID, (err, vote) => {
        if (err) throw err;
        if (vote) {
            res.render('vote/submit', {
                title: 'Abstimmen',
                nav,
                vote,
                pagename: 'list'
            });
        } else res.sendStatus(401);
    });
})

voteRouter.post('/submit/:voteID', (req, res) => {
    Vote.findById(req.params.voteID, (err, vote) => {
        if (err) throw err;
        if(!vote.isVoteRunning) return res.sendStatus(401);
    });
});

module.exports = voteRouter;