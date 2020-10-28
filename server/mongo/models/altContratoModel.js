const mongoose = require('mongoose');

const altContratoSchema = new mongoose.Schema({
    codigoEmpresa: {
        type: Number,
        trim: true
    },
    numeroAlteracao: {
        type: String,
        trim: true
    },
    numeroRegistro: {
        type: String,
        trim: true
    },
    numeroSei: {
        type: String,
        trim: true
    },
    dataJunta: {
        type: Date,
        trim: true
    },
    info: {
        type: String,
        trim: true
    },
},
    {
        timestamps: true,
        strict: false
    });

const altContratoModel = mongoose.model('altContrato', altContratoSchema, 'altContrato');

module.exports = altContratoModel