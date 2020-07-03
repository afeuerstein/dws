console.clear();
const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('web');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

mongoose.connect('mongodb://localhost/dws', { useUnifiedTopology: true, useNewUrlParser: true }, function(err) {
    if (err) throw err;
    debug('Database connected!');
});

var app = express();

app.use(morgan(chalk.blue.bold('  morgan ') + chalk.yellow(':method :url :status :res[content-length] - :response-time ms')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'digitaleswahlsystem',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('views', './views');
app.set('view engine', 'ejs');

const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
app.use('/auth', authRouter);
app.use('/admin', adminRouter);

var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

app.get('/', (req, res) => {
    res.render('index', {
        user: req.user,
    });
});

app.listen(3000, () => {
    debug(chalk.green("Server listening on port 3000."));
});

app.use((req, res, next) => {
    res.status(404).render("404");
});