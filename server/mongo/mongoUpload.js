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
//*********************************CREATE STORAGE CLASS AND EXPORT TWO INSTANCES OF IT!!!!********************************  */
const storage = () => {

    const vehicleStorage = new GridFsStorage({

        url: mongoURI,
        file: (req, file) => {
            gfs.collection('vehicleDocs');

            let { metadata } = req.body
            metadata = JSON.parse(metadata)

            Object.keys(metadata).forEach(field => {
                if (!metadata[field]) delete metadata[field]
            })

            metadata.fieldName = file.fieldname

            const fileInfo = {
                filename: file.originalname,
                metadata,
                bucketName: 'vehicleDocs',
            }
            return fileInfo
        }
    })

    const empresaStorage = new GridFsStorage({

        url: mongoURI,
        file: (req, file) => {
            gfs.collection('empresaDocs')

            let { metadata } = req.body
            metadata = JSON.parse(metadata)

            let fileInfo = {
                filename: file.originalname,
                metadata,
                bucketName: 'empresaDocs',
            }
            return fileInfo
        }
    })

    const
        vehicleUpload = multer({ storage: vehicleStorage }),
        empresaUpload = multer({ storage: empresaStorage, inMemory: true }),
        memoryStorage = multer({ dest: 'uploads/', inMemory: true })

    return { empresaUpload, vehicleUpload, memoryStorage }
}


const uploadMetadata = (req, res, next) => {
    let filesArray = []
    if (req.files) req.files.forEach(f => {
        filesArray.push({
            id: f.id,
            length: f.size,
            chunkSize: f.chunkSize,
            uploadDate: f.uploadDate,
            filename: f.originalname,
            md5: f.md5,
            contentType: f.contentType,
            metadata: f.metadata
        })
    })
    req.filesArray = filesArray
    next()
}

module.exports = { storage, uploadMetadata }