const
    mongoose = require('mongoose'),
    distanciaSchema = new mongoose.Schema({
        comercial: {
            type: Number,
            trim: true,
            default: 65,
        },
        comercialExecutivo: {
            type: Number,
            trim: true,
            default: 65,
        },
        convencional: {
            type: Number,
            trim: true,
            default: 70,
        },
        convencionalExecutivo: {
            type: Number,
            trim: true,
            default: 79,
        },
        leito: {
            type: Number,
            trim: true,
            default: 105,
        },
        leitoExecutivo: {
            type: Number,
            trim: true,
            default: 79,
        },
        semiLeito: {
            type: Number,
            trim: true,
            default: 95,
        },
        semiLeitoExecutivo: {
            type: Number,
            trim: true,
            default: 79,
        },
    }, { _id: false, id: false, strict: false })

module.exports = distanciaSchema