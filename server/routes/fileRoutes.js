//@ts-check
const router = require('express').Router()
const { Grid } = require("gridfs-stream")
const { default: mongoose } = require("mongoose")
const FileController = require('../controllers/FileController')
const fileBackup = require("../fileBackup/fileBackup")
const { permanentBackup } = require("../fileBackup/permanentBackup")
const prepareBackup = require("../fileBackup/prepareBackup")
const { conn } = require("../mongo/mongoConfig")
const { mongoDownload, getFilesMetadata, getOneFileMetadata } = require("../mongo/mongoDownload")
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
}

module.exports = { fileRouter }