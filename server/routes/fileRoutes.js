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
        FileController.empresaUpload
    )

    app.post('/api/vehicleUpload',
        prepareBackup,
        vehicleUpload.any(),
        uploadMetadata,
        FileController.vehicleUpload
    )
    app.get('/api/mongoDownload/', FileController.mongoDownload)
    app.get('/api/getFiles/:collection', FileController.getFiles)
    app.get('/api/getOneFile/', FileController.getOneFileMetadata)
    app.put('/api/updateFilesMetadata', FileController.updateFilesMetadata)
    app.delete('/api/deleteFile', FileController.deleteFile)
    app.delete('/deleteManyFiles', FileController.deleteMany)
}

module.exports = { fileRouter }