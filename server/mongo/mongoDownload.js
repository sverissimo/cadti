const
    { mongo } = require('mongoose'),
    { filesModel } = require('./models/filesModel'),
    { empresaModel } = require('./models/empresaModel')

const mongoDownload = (req, res, gfs) => {

    const fileId = new mongo.ObjectId(req.query.id)
    const collection = req.query.collection

    gfs.collection(collection)
    gfs.files.findOne({ _id: fileId }, (err, file) => {

        if (!file) {
            return res.status(404).json({
                responseMessage: err,
            })
        } else {

            const readstream = gfs.createReadStream({
                filename: file.filename,
            });

            res.set({
                'Content-Type': file.contentType,
                'Content-Disposition': 'attachment',
            });
            return readstream.pipe(res)
        }
    })
}

const getFilesMetadata = (req, res) => {

    let filesCollection, fieldName

    if (req.params.collection === 'vehicleDocs') filesCollection = filesModel
    if (req.params.collection === 'empresaDocs') filesCollection = empresaModel
    if (req.query.fieldName) fieldName = { 'metadata.fieldName': req.query.fieldName }

    filesCollection.find(fieldName).sort({ uploadDate: -1 }).exec((err, doc) => res.send(doc))
}

const getOneFileMetadata = (req, res) => {

    const { collection, id } = req.query

    let filesCollection = empresaModel
    if (collection === 'vehicleDocs') filesCollection = filesModel

    filesCollection.find({ 'metadata.procuracaoId': id.toString() }).exec((err, doc) => res.send(doc))
}

module.exports = { mongoDownload, getFilesMetadata, getOneFileMetadata }