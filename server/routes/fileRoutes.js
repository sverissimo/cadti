//@ts-check
const FileController = require('../controllers/FileController')
const prepareBackup = require("../fileBackup/prepareBackup")
const { storage, uploadMetadata } = require("../mongo/mongoUpload")
const { vehicleUpload, empresaUpload } = storage()

const fileRouter = app => {

    app.post('/api/empresaUpload',
        prepareBackup,
        empresaUpload.any(),
        uploadMetadata,
        (req, res) => new FileController().empresaUpload(req, res)
    )

    app.post('/api/vehicleUpload',
        prepareBackup,
        vehicleUpload.any(),
        uploadMetadata,
        new FileController().vehicleUpload
    )
    app.get('/api/mongoDownload/', new FileController().mongoDownload)
    app.get('/api/getFiles/:collection', new FileController().getFiles)
    app.get('/api/getOneFile/', new FileController().getOneFileMetadata)
    app.put('/api/updateFilesMetadata', new FileController().updateFilesMetadata)
    app.delete('/api/deleteFile', new FileController().deleteFile)
    app.delete('/deleteManyFiles', new FileController().deleteMany)
}

module.exports = { fileRouter }