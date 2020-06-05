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
    empresaId: {
        type: String,
        trim: true
    },
    veiculoId: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        trim: true
    },
    content: { type: [] },
},
    {
        timestamps: true,
        strict: false
    });

const logsModel = mongoose.model('logs', logsSchema, 'logs');

module.exports = { logsModel }