/**
 * MODEL
 * Memory schema for MongoDB
 */

/* --- IMPORTS --- */
const mongoose = require('mongoose');

/* --- SCHEMA --- */
const Memory = new mongoose.Schema({
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    interested: { type: Array, default: [] }, //array of IDs of users that put it in favorite
    timestamp: { type: Date, default: Date.now },
});

/* --- PROCESSES --- */
module.exports = mongoose.model('Memory', Memory);
