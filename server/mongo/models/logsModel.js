const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({    
    subject: {
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
    status: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        trim: true
    },
}, 
{ 
    timestamps: { createdAt: 'created_at' },
    strict: false
 });

const logsModel = mongoose.model('logs', logsSchema, 'logs');

module.exports = { logsModel }