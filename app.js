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
const config = require('./config.json');
const https = require('https')
const http = require('http')
const fs = require('fs');
const favicon = require('serve-favicon');

//connect to mongo
mongoose.connect('mongodb://localhost/dws', {useUnifiedTopology: true, useNewUrlParser: true}, function (err) {
    if (err) {
        console.log(chalk.red.dim('! ') + 'Es konnte keine Verbindung zur Datenbank hergestellt werden.')
        process.exit();
    }
    debug('Database connected!');
});

//check if a user exists in the database, if not, run user setup
const Account = require('./models/account');
const userSetup = require('./util/usersetup');
Account.find({}, (err, res) => {
    if (!res.length) {
        userSetup.userSetup(Account);
    }
});

//init express
var app = express();

if (config.ssl) {
//redirect http to https
    app.use((req, res, next) => {
        if (req.secure) {
            return next();
        }
        res.redirect('https://' + req.hostname + req.url);
    });
}

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
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//define routes
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const voteRouter = require('./routes/vote');
app.use('/vote', voteRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);

//define passport strategy
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

app.get('/', (req, res) => {
    res.render('index', {
        user: req.user,
    });
});

app.use((req, res, next) => {
    res.status(404).render("404");
    next();
});

if (config.ssl) {
    //get ssl keys
    const options = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem'),
        passphrase: 'test'
    };

    http.createServer(app).listen(80);
    https.createServer(options, app).listen(443);
    debug(chalk.green(`Server listening on port ${config.port}.`));
} else {
    app.listen(config.port, () => {
        debug(chalk.green(`Server listening on port ${config.port}.`));
    });
}