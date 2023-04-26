//@ts-check
const mongoose = require('mongoose')
const { permanentBackup } = require("../fileBackup/permanentBackup")
const { mongoDownload, getFilesMetadata, getOneFileMetadata } = require("../mongo/mongoDownload")
const { empresaChunks, vehicleChunks } = require('../mongo/models/chunksModel')
const { filesModel } = require('../mongo/models/filesModel')
const Grid = require('gridfs-stream')
const { Repository } = require('../repositories/Repository')

class FileController {

    /** @type {Grid.Grid} gfs     */
    gfs
    constructor() {
        mongoose.connection.once('open', () => this.gfs = Grid(mongoose.connection.db, mongoose.mongo))
    }

    empresaUpload = async (req, res) => {
        if (!req.files || !req.files.length) {
            return res.status(400).send('No files to upload')
        }

        const io = req.app.get('io')
        const codigo_empresa = parseInt(req.files[0].metadata.empresaId)
        const empresas = await new Repository('empresas', 'codigo_empresa').find(codigo_empresa)
        const { razao_social: razaoSocial } = empresas[0]
        const filesMetadata = req.files.map(f => ({ ...f, length: f.size, metadata: { ...f.metadata, razaoSocial } }))

        io.sockets.emit('insertFiles', { insertedObjects: filesMetadata, collection: 'empresaDocs' })
        io.to('backupService').emit('newFileSaved', filesMetadata)
        return res.json({ file: filesMetadata })
    }

    vehicleUpload = (req, res) => {

        const { filesArray } = req

        if (filesArray && filesArray[0]) {
            const io = req.app.get('io')
            io.sockets.emit('insertFiles', { insertedObjects: filesArray, collection: 'vehicleDocs' })
            res.json({ file: filesArray })
        } else res.send('No uploads whatsoever...')
    }

    mongoDownload = (req, res) => mongoDownload(req, res, this.gfs)
    getFiles = async (req, res) => {
        const { user } = req
        const { collection } = req.params
        const { fieldName } = req.query

        const files = await getFilesMetadata({
            user,
            collection,
            fieldName
        })
        return res.send(files)
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

    deleteFile = async (req, res) => {
        const { id, collection } = req.query
        const fileId = new mongoose.mongo.ObjectId(id)

        let chunks
        this.gfs.collection(collection)

        this.gfs.files.deleteOne({ _id: fileId }, (err, result) => {
            if (err) console.log(err)
            //if (result) console.log(result)
        })

        if (collection === 'empresaDocs') chunks = empresaChunks
        if (collection === 'vehicleDocs') chunks = vehicleChunks

        chunks.deleteMany({ files_id: fileId }, (err, result) => {
            if (err) console.log(err)
            if (result) {
                console.log(result)
                res.json(result)
            }
        })
        const io = req.app.get('io')
        io.sockets.emit('deleteOne', { tablePK: '_id', id, collection })
    }

    //REFACTOR! Obs: no frondEnd client is requesting this. Keep it?
    deleteMany = async (req, res) => {
        const
            { id } = req.query

        console.log(id, typeof id)
        const docsToDelete = { 'metadata.veiculoId': id }

        this.gfs.collection('vehicleDocs')

        const getIds = await filesModel.filesModel.find(docsToDelete).select('_ids')
        const ids = getIds.map(e => new mongoose.mongo.ObjectId(e._id))

        let r
        ids.forEach(fileId => {
            this.gfs.files.deleteOne({ _id: fileId }, (err, result) => {
                if (err)
                    console.log(err)
                if (result)
                    r = result
            })
            //        if (collection === 'empresaDocs') chunks = empresaChunks
            //      if (collection === 'vehicleDocs') chunks = vehicleChunks

            vehicleChunks.deleteMany({ files_id: fileId }, (err, result) => {
                if (err) console.log(err)
                if (result) {
                }
            })
        })
        res.send(r || 'no files deleted.')
        //    io.sockets.emit('deleteOne', { tablePK: '_id', id, collection })
    }
}

module.exports = FileController
