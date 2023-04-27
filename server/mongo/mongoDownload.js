//@ts-check
const
    { mongo } = require('mongoose'),
    { filesModel } = require('./models/filesModel'),
    { empresaModel } = require('./models/empresaModel')

const mongoDownload = (req, res, gfs) => {

    const fileId = new mongo.ObjectId(req.query.id)
    const collection = req.query.collection

    gfs.collection(collection)
    gfs.files.findOne({ _id: fileId }, (err, file) => {

        if (!file)
            return res.status(404).json({ responseMessage: err })

        else {
            const readStream = gfs.createReadStream({ filename: file.filename })

            res.set({
                'Content-Type': file.contentType,
                'Content-Disposition': 'attachment',
            })
            return readStream.pipe(res)
        }
    })
}


const getOneFileMetadata = async (req, res) => {

    const
        { collection, md5 } = req.query
        , filter = { md5 }

    let filesCollection = empresaModel
    if (collection === 'vehicleDocs') filesCollection = filesModel

    filesCollection.findOne(filter, (err, doc) => {
        if (err)
            console.log(err)
        res.send(doc)
    })
    //filesCollection.find(filter).exec((err, doc) => res.send(doc))
}

module.exports = { mongoDownload, getOneFileMetadata }