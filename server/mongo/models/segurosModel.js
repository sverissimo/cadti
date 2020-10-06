const mongoose = require('mongoose');

const segurosSchema = new mongoose.Schema({
    apolice: {
        type: String,
        trim: true
    },
    seguradora_id: {
        type: Number,
        trim: true
    },
    data_emissao: {
        type: Date,
        trim: true
    },
    vencimento: {
        type: Date,
        trim: true
    },
    codigo_empresa: {
        type: String,
        trim: true
    },
    situacao: {
        type: String,
        trim: true
    },
    veiculos: { type: [] },
},
    {
        timestamps: true,
        strict: false
    });

const segurosModel = mongoose.model('seguros', segurosSchema, 'seguros');

module.exports = segurosModel