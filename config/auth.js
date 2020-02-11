/**
 * CONFIG
 * Passport Strategies to manage register, login and sessions
 * /


/* --- IMPORTS --- */
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/* --- PROCESSES --- */
module.exports = (passport) => {

    passport.serializeUser((user, next) => {
        next(null, user);
    });

    passport.deserializeUser((id, next) => {
        User.findById(id, (err, user) => {
            next(err, user);
        })
    });

    //LOGIN STRATEGY
    const localLogin = new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, next) => {
        User.findOne({ email: email }, (err, user) => {
            //If error
            if (err) {
                console.log('Login :error');
                return next(err);
            }

            //If not found
            if (user == null) {
                console.log('Login : not found');
                return next(new Error('User not found'));
            }

            //If wrong password
            if (bcrypt.compareSync(password, user.password) == false) {
                console.log('Login :Wrong Password');

                return next(new Error('Incorrect password'));
            }

            //Else success
            console.log('Login: success');
            return next(null, user);
        });
    });

    passport.use('localLogin', localLogin);

    //REGISTER STRATEGY
    const localRegister = new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, next) => {
        User.findOne({ email: email }, (err, user) => {
            //If error
            if (err) {
                console.log('Register : error');
                return next(err);
            }

            //If found
            if (user != null) {
                console.log('Register : already exist');
                return next(new Error('User already exists, please log in.'));
            }

            //Else, Create new user
            const hashedPw = bcrypt.hashSync(password, 10);
            let isAdmin = false;

            User.create({ email: email, password: hashedPw, isAdmin: isAdmin }, (err, user) => {
                if (err) {
                    console.log('Register : Error creating');
                    return next(err);
                }

                console.log('Register : Success');
                next(null, user);

            });

        });
    });

    passport.use('localRegister', localRegister);

};