const
    mongoose = require('mongoose'),
    distanciaSchema = require('./parametros/distanciaSchema'),
    idadeBaixaSchema = require('./parametros/idadeBaixaSchema')

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
    distanciaPoltronas: { type: distanciaSchema },
    idadeBaixa: { type: idadeBaixaSchema }
},
    {
        timestamps: true,
        strict: false
    });

const parametrosModel = mongoose.model('parametros', parametrosSchema, 'parametros');

module.exports = parametrosModel