const express = require('express');
const nav = require('../util/navigation').getNav("admin");
var Account = require('../models/account');
const voteRouter = express.Router();

voteRouter.use((req, res, next) => {
    if (!req.user) {
        res.redirect('/auth/login');
    } else next();
});
 
voteRouter.get('/', function(req, res) {
    res.render('asd/asd');
});

module.exports = voteRouter;