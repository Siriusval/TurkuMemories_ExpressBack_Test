/**
 * MAIN
 * Server
 * Instantiate all the routes and app settings for the webapp
 * 
 */

/* --- IMPORTS --- */
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

/* --- FUNCTIONS --- */
const auth = require('./config/auth')(passport);

/* --- ROUTES --- */
const home = require('./routes/home');
const register = require('./routes/register');
const login = require('./routes/login');
const account = require('./routes/account');
const admin = require('./routes/admin');

/* --- DATABASE --- */
mongoose.connect('***REMOVED***', (err, data) => {
    if (err) {
        console.log('DB Connection Failed');
        return
    }

    console.log('DB Connection Success');
});

/* --- APP --- */
//Creation express app
const app = express();

//Use session
app.use(session({
    secret: '***REMOVED***',
    resave: true,
    saveUninitialized: true
}));

//Use passport to signIN/OUT/UP
app.use(passport.initialize());
app.use(passport.session());

//Use hjs view rendering
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

/* --- MIDDLEWARE --- */
//Allow Json response
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Set path for public ressources
app.use(express.static(path.join(__dirname, 'public')));

//Link url paths to views
app.use('/', home);
app.use('/register', register);
app.use('/login', login);
app.use('/account', account);
app.use('/admin', admin);

//View to display errors
app.use((err, req, res, next) => {
    res.render('error', { message: err.message });
});

//Listening on port 5000
app.listen(5000);
console.log('App running on http://localhost:5000');