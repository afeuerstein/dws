const express = require('express');
const nav = require('../util/navigation').getNav("admin");
const Account = require('../models/account');
const Vote = require('../models/vote');
const adminRouter = express.Router();
const votemanager = require('../util/votemanager');

function randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

adminRouter.use((req, res, next) => {
    if (!req.user) {
        res.redirect('/auth/login');
    } else if (!req.user.admin) {
        res.render('401');
    } else next();
});

adminRouter.get('/', (req, res) => { res.redirect('/admin/userlist') });

adminRouter.get('/userlist', (req, res) => {
    let query = Account.find({});
    query.exec((err, result) => {
        res.render('admin/userlist', {
            title: 'Benutzerverwaltung',
            nav,
            users: result,
            pagename: 'userlist'
        });
    });
});

adminRouter.get('/adduser', (req, res) => {
    res.render('admin/adduser', {
        title: 'Nutzer Registrieren',
        nav,
        pagename: 'adduser'
    });
});

adminRouter.post('/adduser', (req, res) => {
    const auth_id = randomString(32);
    const newUser = new Account({
        username: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        auth_id,
    });
    newUser.save();
    res.render('admin/displayid', {
        title: 'Auth-ID von ' + req.body.lastname,
        lastname: req.body.lastname,
        firstname: req.body.firstname,
        email: req.body.email,
        auth_id,
        nav,
        pagename: 'displayid',
    });
});

adminRouter.get('/userdetail/:userID', (req, res) => {
    Account.findById(req.params.userID, (err, user) => {
        if (err) throw err;
        res.render('admin/userdetail', {
            title: 'Details  zu ' + user.lastname,
            user,
            nav,
            pagename: "userdetail",
        });
    });
});

adminRouter.post('/reset_authid/:userID', (req, res) => {
    Account.findById(req.params.userID, (err, user) => {
        if (err) throw err;
        user.auth_id = randomString(32);
        user.save();
        res.render('success');
    });
});

adminRouter.get('/vote', (req, res) => {
    Vote.find({}).exec((err, result) => {
        if (err) throw err;
        res.render('admin/votes', {
            title: 'Abstimmungen Verwalten',
            nav,
            votes: result,
            pagename: 'votes'
        });
    })
});

adminRouter.get('/vote/new', (req, res) => {
    res.render('admin/newvote', {
        title: 'Neue Abstimmung ertsellen',
        nav,
    });
});

adminRouter.post('/vote/new', (req, res) => {
    const date = votemanager.getDateByString(req.body.daterange);
    const newVote = new Vote({
        title: req.body.title,
        description: req.body.description,
        date: {
            startDate: date.startDate,
            endDate: date.endDate
        }
    });
    newVote.save();
    res.redirect('/admin/vote');
})

module.exports = adminRouter;