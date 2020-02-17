/**
 * ROUTE
 * Register : /register endpoint
 * register the user using passport strategy(in auth.js)
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
 * Register the user, then redirect to /account page
 */
router.post(
    '/',
    passport.authenticate('localRegister', {
        successRedirect: '/account',
    })
);

module.exports = router;
