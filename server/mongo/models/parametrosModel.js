const mongoose = require('mongoose');

const parametrosSchema = new mongoose.Schema({
    idadeMaxCad: {
        type: Number,
        trim: true
    },
    difIdade: {
        type: Number,
        trim: true
    },
    idadeBaixaAut: {
        type: Number,
        trim: true
    },
    diaBaixaAut: {
        type: String,
        trim: true
    },
    prazoAvisoBaixa: {
        type: Number,
        trim: true
    },
    distanciasPoltrona: { type: Object },
},
    {
        timestamps: true,
        strict: false
    });

const parametrosModel = mongoose.model('parametros', parametrosSchema, 'parametros');

module.exports = parametrosModel