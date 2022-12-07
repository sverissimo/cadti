//@ts-check
const mongoose = require('mongoose')
const Grid = require("gridfs-stream")
const fileBackup = require("../fileBackup/fileBackup")
const { permanentBackup } = require("../fileBackup/permanentBackup")
const { conn } = require("../mongo/mongoConfig")
const { mongoDownload, getFilesMetadata, getOneFileMetadata } = require("../mongo/mongoDownload")

//@ts-ignore
Grid.mongo = mongoose.mongo

let gfs
conn.on('error', console.error.bind(console, 'connection error:'))
conn.once('open', () => {
    //@ts-ignore
    gfs = Grid(conn.db)
    gfs.collection('vehicleDocs')
    console.log('Mongo connected to the server.')
})

class FileController {

    static empresaUpload = (req, res) => {
        //Passa os arquivos para a função fileBackup que envia por webSocket para a máquina local.
        const io = req.app.get('io')
        const { filesArray } = req
        fileBackup(req, filesArray)

        if (filesArray && filesArray[0]) {
            io.sockets.emit('insertFiles', { insertedObjects: filesArray, collection: 'empresaDocs' })
            res.json({ file: filesArray })
        } else res.send('No uploads whatsoever...')
    }

    static vehicleUpload = (req, res) => {
        //Passa os arquivos para a função fileBackup que envia por webSocket para a máquina local.
        const { filesArray } = req
        fileBackup(req, filesArray)

        if (filesArray && filesArray[0]) {
            const io = req.app.get('io')
            io.sockets.emit('insertFiles', { insertedObjects: filesArray, collection: 'vehicleDocs' })
            res.json({ file: filesArray })
        } else res.send('No uploads whatsoever...')
    }

    static mongoDownload = (req, res) => mongoDownload(req, res, gfs)
    static getFiles = async (req, res) => {
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

    static getOneFileMetadata = (req, res) => getOneFileMetadata(req, res)

    static updateFilesMetadata = async (req, res) => {
        const
            { collection, ids, metadata, id, md5 } = req.body,
            update = {}

        if (!ids) {
            res.send('no file sent to the server')
            return
        }
        Object.entries(metadata).forEach(([k, v]) => {
            update['metadata.' + k] = v
        })
        const parsedIds = ids.map(id => new mongoose.mongo.ObjectId(id))
        res.locals.fileIds = ids
        res.locals.collection = collection

        permanentBackup(req, res)
        gfs.collection(collection)
        gfs.files.updateMany(
            { "_id": { $in: parsedIds } },
            { $set: { ...update } },
            async (err, doc) => {
                if (err) console.log(err)
                if (doc) {
                    const data = {
                        collection,
                        metadata,
                        ids,
                        primaryKey: 'id'
                    }
                    const io = req.app.get('io')
                    io.sockets.emit('updateDocs', data)
                    res.send({ doc, ids })
                    return
                }
            }
        )
    }
}

module.exports = FileController
