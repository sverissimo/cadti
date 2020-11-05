const
    mongoose = require('mongoose'),
    AutoIncrement = require('mongoose-sequence')(mongoose)

const LogsSchema = new mongoose.Schema({
    numero: {
        type: Number
    },
    subject: {
        type: String,
        trim: true
    },
    empresaId: {
        type: Number,
        trim: true
    },
    veiculoId: {
        type: Number,
        trim: true
    },
    apolice: {
        type: String,
        trim: true
    },
    laudoId: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    history: { type: [] },
},
    {
        timestamps: true,
        strict: false
    });

LogsSchema.plugin(AutoIncrement, { id: 'log_counter', inc_field: 'numero' });

const logsModel = mongoose.model('logs', LogsSchema, 'logs');

module.exports = logsModel