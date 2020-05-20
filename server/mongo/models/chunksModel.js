const mongoose = require('mongoose')

const
    Any = new mongoose.Schema({ any: mongoose.Schema.Types.Mixed }),
    empresaChunks = mongoose.model('empresaDocs.chunk', Any, 'empresaDocs.chunks'),
    vehicleChunks = mongoose.model('vehicleDocs.chunk', Any, 'vehicleDocs.chunks')

module.exports = { empresaChunks, vehicleChunks }