const mongoose = require('mongoose')
const { conn } = require('./mongoConfig')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
Grid.mongo = mongoose.mongo
const { mongoURI } = require('./mongoConfig')

let gfs

conn.on('error', console.error.bind(console, 'connection error:'))
conn.once('open', () => {
    gfs = Grid(conn.db);
    gfs.collection('vehicleDocs')
})

function uploadHandler(collection) {
    const storage = new GridFsStorage({
        url: mongoURI,
        file: (req, file) => {
            gfs.collection(collection)

            const metadata = JSON.parse(req.body.metadata)
            metadata.fieldName = metadata.fieldName || file.fieldname

            const fileInfo = {
                filename: file.originalname,
                metadata,
                bucketName: collection,
            }
            return fileInfo
        }
    })

    const upload = multer({ storage })
    return upload
}

const empresaUpload = uploadHandler('empresaDocs')
const vehicleUpload = uploadHandler('vehicleDocs')

module.exports = { empresaUpload, vehicleUpload }
