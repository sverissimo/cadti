//@ts-check
const FileController = require('../controllers/FileController')
const { empresaUpload, vehicleUpload } = require("../mongo/mongoUpload")

const fileController = new FileController()
const fileRouter = app => {
    app.post('/api/empresaUpload',
        empresaUpload.any(),
        fileController.backupAndSendUpdate
    )

    app.post('/api/vehicleUpload',
        vehicleUpload.any(),
        fileController.backupAndSendUpdate
    )

    app.get('/api/mongoDownload/', fileController.mongoDownload)
    app.get('/api/getFiles/:collection', fileController.getFiles)
    app.get('/api/getOneFile/', fileController.getOneFileMetadata)
    app.put('/api/updateFilesMetadata', fileController.updateFilesMetadata)
    app.delete('/api/deleteFile', fileController.deleteFile)
    app.delete('/deleteManyFiles', fileController.deleteMany)
}

module.exports = { fileRouter }
