const mongoose = require('mongoose')
//AutoIncrement = require('mongoose-sequence')(mongoose)

const alertSchema = new mongoose.Schema({
    empresaId: {
        type: Number
    },
    to: {
        type: []
    },
    subject: {
        type: String,
        trim: true
    },
    vocativo: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true,
        strict: false
    });

//alertSchema.plugin(AutoIncrement, { id: 'log_counter', inc_field: 'numero' });

const alertModel = mongoose.model('alerts', alertSchema, 'alerts');

module.exports = alertModel