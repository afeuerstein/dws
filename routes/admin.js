const express = require('express');
const Account = require('../models/account');
const adminRouter = express.Router();

adminRouter.use((req, res, next) => {
    if (!req.user) {
        res.redirect('/auth/login');
    } else if (!req.user.admin) {
        res.render('401');
    } else next();
});

adminRouter.get('/', (req, res) => {
    let query = Account.find({});
    query.exec((err, result) => {
        res.render('userlist', {
            title: 'Benutzerverwaltung',
            users: result,
        });
    });
});

module.exports = adminRouter;