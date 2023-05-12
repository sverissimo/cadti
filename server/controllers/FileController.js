//@ts-check
const mongoose = require('mongoose')
const Grid = require('gridfs-stream')
const { FileService } = require('../services/FileService')
const { CustomSocket } = require('../sockets/CustomSocket')
const { conn } = require('../mongo/mongoConfig')

class FileController {

    /** @type {Grid.Grid} gfs     */
    gfs
    constructor(collection) {
        this.collection = collection
        if (!this.gfs) {
            mongoose.connection.once('open', () => { this.gfs = Grid(conn.db, mongoose.mongo) })
        }
    }

    backupAndSendUpdate = async (req, res, next) => {
        const { files } = req
        if (!files || !files.length) {
            return res.status(400).send('No files to upload')
        }

        try {
            const io = req.app.get('io')
            const filesMetadata = await FileService.createBackupMetadata(files)
            const { metadata } = filesMetadata[0]
            const { empresaId } = metadata && metadata

            const filesSocket = new CustomSocket(io, this.collection)

            filesSocket.emit('insertFiles', filesMetadata, empresaId)
            io.to('backupService').emit('newFileSaved', filesMetadata)
            return res.json({ files: filesMetadata })
        } catch (error) {
            next(error)
        }
    }

    download = async (req, res, next) => {
        try {
            const { id } = req.query
            const collection = req.query.collection

            const queryResult = await new FileService(collection).download(id, this.gfs)
            if (!queryResult) {
                return res.status(404).send('File not found')
            }

            const { file, fileStream } = queryResult

            res.set({
                'Content-Type': file.contentType,
                'Content-Disposition': 'attachment',
            })

            return fileStream.pipe(res)

        } catch (error) {
            next(error)
        }
    }

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

    getFileMetadata = async (req, res, next) => {
        try {
            const { collection, ...filter } = req.query
            const fileService = new FileService(collection)
            const file = await fileService.getFileMetadata({ ...filter })
            res.send(file)
        } catch (error) {
            next(error)
        }
    }

    updateFilesMetadata = async (req, res, next) => {
        const { collection, ids, metadata } = req.body

        if (!ids) {
            return res.status(400).send('no file sent to the server')
        }

        try {
            const fileService = new FileService(collection)
            const files = await fileService.updateFilesMetadata(ids, metadata)
            if (!files || !Array.isArray(files)) {
                return res.status(404).send('No files found with the IDs sent.')
            }

            const data = {
                collection,
                metadata,
                ids,
                primaryKey: 'id'
            }

            const io = req.app.get('io')
            const filesMetadata = await FileService.createBackupMetadata(files)

            //### TODO: avaliar se é preciso o backup do arquivo novamente ao se alterar a metadata (Procurações)
            if (!metadata.veiculoId) {
                io.to('backupService').emit('newFileSaved', filesMetadata)
            }

            const { empresaId } = filesMetadata[0].metadata
            console.log("🚀 ~ file: FileController.js:118 ~ FileController ~ updateFilesMetadata= ~ empresaId:", empresaId)
            const filesSocket = new CustomSocket(io, collection)
            filesSocket.emit('updateDocs', data, empresaId)
            return res.status(204).end()
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
