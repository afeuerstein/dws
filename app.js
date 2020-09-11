console.clear();
const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('web');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

mongoose.connect('mongodb://localhost/dws', {useUnifiedTopology: true, useNewUrlParser: true}, function (err) {
    if (err) {
        console.log(chalk.red.dim('! ') + 'Es konnte keine Verbindung zur Datenbank hergestellt werden.')
        process.exit();
    }
    debug('Database connected!');
});

//check if a user exists in the database, if not, run user setup
var Account = require('./models/account');
const userSetup = require('./util/usersetup');
Account.find({}, (err, res) => {
    if (!res.length) {
        userSetup.userSetup(Account);
    }
});

var app = express();

app.use(morgan(chalk.blue.bold('  morgan ') + chalk.yellow(':method :url :status :res[content-length] - :response-time ms')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
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
const voteRouter = require('./routes/vote');
app.use('/vote', voteRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);

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

app.use((req, res) => {
    res.status(404).render("404");
});