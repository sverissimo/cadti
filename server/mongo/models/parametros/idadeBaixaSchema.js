const
    mongoose = require('mongoose'),
    idadeBaixaSchema = new mongoose.Schema({
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
        }
    }, { _id: false, strict: false })

module.exports = idadeBaixaSchema






