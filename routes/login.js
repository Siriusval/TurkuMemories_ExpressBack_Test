/**
 * ROUTE
 * Login : /login endpoint
 * log the user using passport strategy(in auth.js)
 *
 *  (post) : '/'
 */

/* --- IMPORTS --- */
const express = require('express');
const router = express.Router();
const passport = require('passport');

/* --- ENDPOINTS --- */
/**
 * (post) : '/'
 * Log the user, then redirect to /account page
 */
router.post(
    '/',
    passport.authenticate('localLogin', {
        successRedirect: '/account',
    })
);

module.exports = router;
