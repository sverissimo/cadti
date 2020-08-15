const
    mongoose = require('mongoose'),
    AutoIncrement = require('mongoose-sequence')(mongoose)

const VehicleLogsSchema = new mongoose.Schema({
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

VehicleLogsSchema.plugin(AutoIncrement, { inc_field: 'numero' });

const vehicleLogsModel = mongoose.model('vehicleLogs', VehicleLogsSchema, 'vehicleLogs');

module.exports = { vehicleLogsModel }