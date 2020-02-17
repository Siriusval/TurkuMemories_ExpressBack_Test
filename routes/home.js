/**
 * ROUTE
 * Home : / endpoints
 * home page where you can try to register, logIn and reset password
 *
 *  (get) : '/'
 */

/* --- IMPORTS --- */
const express = require('express');
const router = express.Router();

/* --- ENDPOINTS --- */
/**
 * (get) : '/'
 * Render home page
 */
router.get('/', (req, res, next) => {
    const data = {
        user: req.user,
    };

    res.render('home', data);
});

module.exports = router;
