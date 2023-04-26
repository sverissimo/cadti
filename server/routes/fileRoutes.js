//@ts-check
const FileController = require('../controllers/FileController')
const { storage, uploadMetadata, empresaUpload } = require("../mongo/mongoUpload")
const { vehicleUpload } = storage()

const fileController = new FileController()
const fileRouter = app => {

    app.post('/api/empresaUpload',
        empresaUpload.any(),
        fileController.empresaUpload
    )

    app.post('/api/vehicleUpload',
        uploadMetadata,
        vehicleUpload.any(),
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
