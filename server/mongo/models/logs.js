const mongoose = require('mongoose');

const logsSchema = mongoose.Schema({
    _id: {
        type: String,
        trim: true
    },
    uploadDate: {
        type: String,
        trim: true
    },
    componente: {
        type: String,
        trim: true
    },
    tema: {
        type: String,
        trim: true
    },
    user: {
        type: String,
        trim: true
    },
    empresa: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        trim: true
    }
});

const logsModel = mongoose.model('logs', logsSchema, 'logs');

module.exports = { logsModel }