/**
 * ROUTE
 * Account : /account endpoints
 * page where you can and/or remove memories from your favorites
 *
 *  (get) : '/'
 *  (get) : '/addmemory/:memoryid'
 *  (get) : '/addfavoritememory/:memoryid'
 *  (get) : '/removefavoritememory/:memoryid'
 *  (get) : '/logout'
 *  (post): '/resetpassword'
 *  (get) : '/password-reset'
 *  (post) : '/newpassword'
 */

/* --- IMPORTS --- */
const express = require('express');
const router = express.Router();
const Mailgun = require('mailgun-js');
const Memory = require('../models/Memory');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/* --- FUNCTIONS --- */
const randomString = length => {
    let text = '';
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

/* --- ENDPOINTS --- */

/**
 * (get) : '/'
 * Render account page
 */
router.get('/', (req, res, next) => {
    const user = req.user;

    //if not autenticated
    if (user == null) {
        res.redirect('/');
        return;
    }

    Memory.find(null, (err, memories) => {
        if (err) {
            return next(err);
        }

        Memory.find({ interested: user._id }, (err, interestedMemories) => {
            if (err) {
                return next(err);
            }

            const data = {
                user: user,
                memories: memories,
                interested: interestedMemories,
            };

            res.render('account', data);
        });
    });
});

/**
 * (get) : '/addFavoritememory/:memoryid'
 * Add memory to favorite, then reload page
 */
router.get('/addfavoritememory/:memoryid', (req, res, next) => {
    const user = req.user;

    console.log('AddFavoriteMemory : Found User');

    if (user == null) {
        console.log('AddFavoriteMemory : User null');
        res.redirect('/');
        return;
    }

    Memory.findById(req.params.memoryid, (err, memory) => {
        if (err) {
            console.log('AddFavoriteMemory : findByID Error');
            return next(err);
        }

        if (memory.interested.indexOf(user._id) == -1) {
            console.log('AddFavoriteMemory : add user to interested');
            memory.interested.push(user._id);
            memory.save();

            console.log('AddFavoriteMemory : redirect');

            res.redirect('/account');
        }
    });
});

/**
 * (get) : '/addmemory'
 * Add memory to catalog and DB
 */
router.post('/addmemory', (req, res, next) => {
    const user = req.user;
    if (user == null) {
        res.redirect('/');
        return;
    }

    Memory.create(req.body, err => {
        if (err) {
            return next(err);
        }

        res.redirect('/account');
    });
});

/**
 * (get) : '/removefavoritememory/:memoryid'
 * Remove memory from favorite, then reload page
 */
router.get('/removefavoritememory/:memoryid', (req, res, next) => {
    const user = req.user;

    if (user == null) {
        res.redirect('/');
        return;
    }

    Memory.findById(req.params.memoryid, (err, memory) => {
        if (err) {
            return next(err);
        }

        memory.interested.pop(user._id);
        memory.save();

        res.redirect('/account');
    });
});

/**
 * (get) : '/logout'
 * Logout user, then redirect to home
 */
router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

/**
 * (post) : '/resetpassword'
 * Send a mail to reset password
 */
router.post('/resetpassword', (req, res, next) => {
    //find user with this email
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            return next(err);
        }

        //if doesn't exist
        if (user == null) {
            return next(new Error("User doesn't exist"));
        }

        //generate nonce and set time (to check validity < 24h)
        user.nonce = randomString(12);
        user.passwordResetTime = new Date();
        user.save();

        //Mailgun api config
        const mailgun = Mailgun({
            apiKey: '***REMOVED***',
            domain: '***REMOVED***',
        });

        const data = {
            to: req.body.email,
            from: '***REMOVED***',
            sender: 'MyTurkuMemories',
            subject: 'Password Reset Request',
            html: `Please click <a style="color:red" href="http://localhost:5000/account/password-reset?nonce=${user.nonce}&id=${user._id}">HERE</a> to reset your password. This link is valid for 24 hours`,
        };

        //Send mail
        mailgun.messages().send(data, (err, body) => {
            if (err) {
                return next(err);
            }

            const data = {
                title: 'Email Sent',
                message:
                    'Please check your email\nClick on the link to reset your password.',
            };
            //success
            res.render('message', data);
        });
    });
});

/**
 * (get) : '/password-reset'
 * Webpage to input new password
 */
router.get('/password-reset', (req, res, next) => {
    //If URL params are null
    const nonce = req.query.nonce;
    const user_id = req.query.id;
    if (nonce == null || user_id == null) {
        return next(new Error('Invalid Request'));
    }

    User.findById(user_id, (err, user) => {
        //if user id doesn't exist
        if (err) {
            return next(new Error('Invalid request'));
        }

        //If user didn't request password reset
        if (user.passwordResetTime == null || user.nonce == null) {
            return next(new Error('Invalid request'));
        }

        //if nonce incorrect
        if (nonce != user.nonce) {
            return next(new Error('Invalid request'));
        }

        //check timestamp
        const now = new Date();
        const diff = now - user.passwordResetTime; //time in ms
        const seconds = diff / 1000;

        if (seconds > 24 * 60 * 60) {
            return next(new Error('Invalid request'));
        }

        //render reset pass page
        const data = {
            id: user_id,
            nonce: nonce,
        };
        res.render('password-reset', data);
    });
});

/**
 * (post) : '/newpassword'
 * Check validity and update password in DB
 */
router.post('/newpassword', (req, res, next) => {
    const password1 = req.body.password1;
    const password2 = req.body.password2;
    const nonce = req.body.nonce;
    const user_id = req.body.id;

    if (
        password1 == null ||
        password2 == null ||
        nonce == null ||
        user_id == null
    ) {
        return next(new Error('Invalid Request'));
    }

    //check password match
    if (password1 != password2) {
        return next(new Error('Passwords do not match.'));
    }

    User.findById(user_id, (err, user) => {
        if (err) {
            return next(err);
        }

        //If user didn't request password reset
        if (user.passwordResetTime == null || user.nonce == null) {
            return next(new Error('Invalid request'));
        }

        //if nonce incorrect
        if (nonce != user.nonce) {
            return next(new Error('Invalid request'));
        }

        //check timestamp
        const now = new Date();
        const diff = now - user.passwordResetTime; //time in ms
        const seconds = diff / 1000;

        if (seconds > 24 * 60 * 60) {
            return next(new Error('Invalid request'));
        }

        //check if password different than before
        if (bcrypt.compareSync(password1, user.password) == true) {
            return next(new Error('Password is the same as the old one'));
        }

        //set new password
        const hashedPw = bcrypt.hashSync(password1, 10);
        user.password = hashedPw;
        user.nonce = null;
        user.passwordResetTime = null;
        user.save();

        const data = {
            title: 'Password changed',
            message: 'Please log in',
        };
        //success
        res.render('message', data);
    });
});

module.exports = router;
