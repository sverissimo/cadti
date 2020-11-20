const
    mongoose = require('mongoose'),
    distanciaSchema = new mongoose.Schema({
        convencional: {
            type: Number,
            trim: true
        },
        executivo: {
            type: Number,
            trim: true
        },
        semiLeito: {
            type: Number,
            trim: true
        },
        leito: {
            type: Number,
            trim: true
        },
        urbano: {
            type: Number,
            trim: true
        }
    }, { _id: false, strict: false })

module.exports = distanciaSchema