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

});

const filesModel = mongoose.model('vehicleDocs.files', filesSchema, 'vehicleDocs.files');

module.exports = { filesModel }