const express = require('express');
const nav = require('../util/navigation').getNav("admin");
const Account = require('../models/account');
const adminRouter = express.Router();

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
    let page = 'userlist';
    query.exec((err, result) => {
        res.render(page, {
            title: 'Benutzerverwaltung',
            nav,
            users: result,
            pagename: page
        });
    });
});

adminRouter.get('/adduser', (req, res) => {
    let page = 'adduser';
    res.render(page, {
        title: 'Nutzer Registrieren',
        nav,
        pagename: page
    });
});

module.exports = adminRouter;