//@ts-check
const mongoose = require('mongoose')
const { permanentBackup } = require("../fileBackup/permanentBackup")
const { mongoDownload, getOneFileMetadata } = require("../mongo/mongoDownload")
const Grid = require('gridfs-stream')
const { FileService } = require('../services/FileService')
const { CustomSocket } = require('../sockets/CustomSocket')

class FileController {

    /** @type {Grid.Grid} gfs     */
    gfs
    constructor() {
        mongoose.connection.once('open', () => this.gfs = Grid(mongoose.connection.db, mongoose.mongo))
    }

    backupAndSendUpdate = async (req, res) => {
        const { files } = req
        if (!files || !files.length) {
            return res.status(400).send('No files to upload')
        }

        const io = req.app.get('io')
        const filesMetadata = await FileService.createBackupMetadata(files)
        console.log("🚀 ~ file: FileController.js:25 ~ FileController ~ backupAndSendUpdate= ~ filesMetadata:", filesMetadata)
        const { metadata } = filesMetadata[0]
        const { empresaId, veiculoId } = metadata && metadata
        console.log("🚀 ~ file: FileController.js:28 ~ FileController ~ backupAndSendUpdate= ~ { empresaId, veiculoId }:", { empresaId, veiculoId })

        //io.sockets.emit('insertFiles', { insertedObjects: files, collection: 'empresaDocs' })
        const collection = veiculoId ? 'vehicleDocs' : 'empresaDocs'
        console.log("🚀 ~ file: FileController.js:31 ~ FileController ~ backupAndSendUpdate= ~ collection:", collection)
        const filesSocket = new CustomSocket(io, collection)

        filesSocket.emit('insertFiles', { insertedObjects: files, collection }, empresaId)
        io.to('backupService').emit('newFileSaved', filesMetadata)
        return res.json({ file: filesMetadata })
    }

    mongoDownload = (req, res) => mongoDownload(req, res, this.gfs)

    getFiles = async (req, res, next) => {
        try {
            const { user } = req
            const { collection } = req.params
            const { fieldName } = req.query
            const files = await new FileService(collection).getFilesMetadata({
                user,
                fieldName
            })

            return res.send(files)
        } catch (error) {
            next(error)
        }
    }

    getOneFileMetadata = (req, res) => getOneFileMetadata(req, res)

    updateFilesMetadata = async (req, res, next) => {
        const { collection, ids, metadata } = req.body
        const update = { metadata }

        if (!ids) {
            return res.send('no file sent to the server')
        }

        try {
            const parsedIds = ids.map(id => new mongoose.mongo.ObjectId(id))
            this.gfs.collection(collection)
            const result = await this.gfs.files.updateMany(
                { "_id": { $in: parsedIds } },
                { $set: { ...update } }
            )

            const data = {
                collection,
                metadata,
                ids,
                primaryKey: 'id'
            }

            const io = req.app.get('io')
            //REFACTOR: Should recipients be filtered???
            io.sockets.emit('updateDocs', data)
            await permanentBackup(parsedIds, collection, io)
            return res.send({ doc: result, ids })
        } catch (err) {
            next(err)
        }
    }

    deleteFile = async (req, res, next) => {
        const { collection } = req.query
        const ids = req.query.id.split(',')

        const role = req.user && req.user.role
        if (role && role !== 'admin' && ids.length > 1) {
            return res.status(403).send('O usuário não possui acesso para esta parte do CadTI.')
        }

        try {
            const io = req.app.get('io')
            const { deletedFiles, deletedChunks } = await new FileService(collection).deleteFile(ids)

            io.sockets.emit('deleteOne', { tablePK: '_id', id: ids[0], collection })
            res.send(`${deletedFiles.deletedCount} files and ${deletedChunks.deletedCount} chunks deleted.`)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = FileController
