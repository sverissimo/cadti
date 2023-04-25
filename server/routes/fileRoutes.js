//@ts-check
const FileController = require('../controllers/FileController')
const prepareBackup = require("../fileBackup/prepareBackup")
const { storage, uploadMetadata } = require("../mongo/mongoUpload")
const { vehicleUpload, empresaUpload } = storage()

const fileController = new FileController()
const fileRouter = app => {

    app.post('/api/empresaUpload',
        prepareBackup,
        empresaUpload.any(),
        uploadMetadata,
        (req, res) => fileController.empresaUpload(req, res)
    )

    app.post('/api/vehicleUpload',
        prepareBackup,
        vehicleUpload.any(),
        uploadMetadata,
        fileController.vehicleUpload
    )
    app.get('/api/mongoDownload/', fileController.mongoDownload)
    app.get('/api/getFiles/:collection', fileController.getFiles)
    app.get('/api/getOneFile/', fileController.getOneFileMetadata)
    app.put('/api/updateFilesMetadata', fileController.updateFilesMetadata)
    app.delete('/api/deleteFile', fileController.deleteFile)
    app.delete('/deleteManyFiles', fileController.deleteMany)
}

module.exports = { fileRouter }