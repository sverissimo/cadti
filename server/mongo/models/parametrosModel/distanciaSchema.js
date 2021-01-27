const
    mongoose = require('mongoose'),
    distanciaSchema = new mongoose.Schema({
        convencional: {
            type: Number,
            trim: true,
            default: 70,
        },
        executivo: {
            type: Number,
            trim: true,
            default: 79,
        },
        semiLeito: {
            type: Number,
            trim: true,
            default: 95,
        },
        leito: {
            type: Number,
            trim: true,
            default: 105,
        },
        urbano: {
            type: Number,
            trim: true,
            default: 65
        }
    }, { _id: false, id: false, strict: false })

module.exports = distanciaSchema