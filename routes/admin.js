/**
 * ROUTE
 * Admin : /admin endpoints 
 * page where you can and/or remove memories from the catalog displayed to users
 * 
 *  (get) : '/'
 *  (get) : '/removefavoritememory/:memoryid'
 */

/* --- IMPORTS --- */
const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');

/* --- ENDPOINTS --- */
/**
 * (get) : '/'
 * Render admin page
 */
router.get('/', (req, res, next) => {
    const user = req.user;

    //if not logged
    if (user == null) {
        res.redirect('/');
        return;
    }
    //if not admin
    if (user.isAdmin == false) {
        res.redirect('/');
        return;
    }

    //get all catalog memories
    Memory.find(null, (err, memories) => {
        if (err) {
            return next(err);
        }

        const data = {
            user: user,
            memories: memories
        };

        res.render('admin', data);
    });

});



/**
 * (get) : '/removefavoritememory/:memoryid'
 * Remove memory from catalog and DB
 */
router.get('/removefavoritememory/:memoryid', (req, res, next) => {
    const user = req.user;
    if (user == null) {
        res.redirect('/');
        return;
    }
    if (user.isAdmin == false) {
        res.redirect('/');
        return;
    }

    Memory.findById(req.params.memoryid, (err, memory) => {
        if (err) {
            return next(err);
        }

        memory.remove();

        res.redirect('/admin');
    });

});


module.exports = router;