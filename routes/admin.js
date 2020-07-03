const express = require('express');
const nav = require('../util/navigation').getNav("admin");
const Account = require('../models/account');
const adminRouter = express.Router();

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

adminRouter.post('/adduser', (req, res) => {
    const auth_id = randomString(32);
    const newUser = new Account({
        username: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        auth_id,
    });
    newUser.save();
    res.render('displayid', {
        title: 'Auth-ID von ' + req.body.lastname,
        lastname: req.body.lastname,
        firstname: req.body.firstname,
        email: req.body.email,
        auth_id,
        nav,
        pagename: 'displayid',
    });
});

module.exports = adminRouter;