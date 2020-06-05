const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({
    subject: {
        type: String,
        trim: true
    },
    empresaId: {
        type: String,
        trim: true
    },
    apolice: {
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

const vehicleLogsModel = mongoose.model('logs', logsSchema, 'logs');

module.exports = { vehicleLogsModel }