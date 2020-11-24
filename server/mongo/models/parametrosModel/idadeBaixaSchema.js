const
    mongoose = require('mongoose'),
    idadeBaixaSchema = new mongoose.Schema({
        idadeMaxCad: {
            type: Number,
            trim: true,
            default: 10,
        },
        difIdade: {
            type: Number,
            trim: true,
            default: 1,
        },
        idadeBaixaAut: {
            type: Number,
            trim: true,
            default: 18,
        },
        diaBaixaAut: {
            type: String,
            trim: true,
            default: '30/04',
        },
        prazoAvisoBaixa: {
            type: Number,
            trim: true,
            default: 15
        }
    }, { _id: false, strict: false })

module.exports = idadeBaixaSchema






