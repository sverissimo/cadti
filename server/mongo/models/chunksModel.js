const mongoose = require('mongoose')


const Any = new mongoose.Schema({ any: mongoose.Schema.Types.Mixed })
const empresaChunks = mongoose.model('empresaDocs.chunk', Any, 'empresaDocs.chunks')

module.exports = { empresaChunks }