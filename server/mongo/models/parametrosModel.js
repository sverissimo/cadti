const
    mongoose = require('mongoose'),
    distanciaSchema = require('./parametros/distanciaSchema'),
    idadeBaixaSchema = require('./parametros/idadeBaixaSchema')

const parametrosSchema = new mongoose.Schema({

    distanciaPoltronas: { type: distanciaSchema },

    idadeBaixa: { type: idadeBaixaSchema }

},
    {
        timestamps: true,
        strict: false
    });

const parametrosModel = mongoose.model('parametros', parametrosSchema, 'parametros');

module.exports = parametrosModel