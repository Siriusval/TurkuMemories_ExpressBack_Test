/**
 * MODEL
 * User schema for MongoDB
 */

/* --- IMPORTS --- */
const mongoose = require('mongoose');

/* --- SCHEMA --- */
const User = new mongoose.Schema({
    email: { type: String, default: '' },
    password: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    nonce: { type: String, default: null },
    passwordResetTime: { type: Date, default: null },
});

/* --- PROCESSES --- */
module.exports = mongoose.model('User', User);
