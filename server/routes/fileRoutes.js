//@ts-check
const FileController = require('../controllers/FileController')
const { empresaUpload, vehicleUpload } = require("../mongo/mongoUpload")
const { requireSeinfra } = require('../auth/checkPermissions')

const fileController = new FileController()
const fileRouter = app => {
    app.post('/api/empresaUpload',
        empresaUpload.any(),
        new FileController('empresaDocs').backupAndSendUpdate
    )

    app.post('/api/vehicleUpload',
        vehicleUpload.any(),
        new FileController('vehicleDocs').backupAndSendUpdate
    )

    app.get('/api/download/', fileController.download)
    app.get('/api/getFiles/:collection', fileController.getFiles)
    app.get('/api/getOneFile/', fileController.getFileMetadata)
    app.put('/api/updateFilesMetadata', requireSeinfra, fileController.updateFilesMetadata)
    app.delete('/api/deleteFile', fileController.deleteFile)
}

module.exports = { fileRouter }
