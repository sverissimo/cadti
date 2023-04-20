const mongoose = require('mongoose');

const filesSchema = mongoose.Schema({
    uploadDate: {
        type: String,
        trim: true
    },
    contentType: {
        type: String,
        trim: true
    },
    metadata: {
        type: {},
    }
})

const empresaModel = mongoose.model('empresaDocs.files', filesSchema, 'empresaDocs.files');

module.exports = { empresaModel }