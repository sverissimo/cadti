const
    { request, response } = require('express')
    , mongoose = require('mongoose')
    , { empresaModel } = require('../mongo/models/empresaModel')
    , { filesModel } = require('../mongo/models/filesModel')
    , { addMetadata } = require('./addMetadata')
    , dotenv = require('dotenv')

/**
 * 
 * @param {request} req 
 * @param {response} res
 */
const permanentBackup = async (req, res) => {
    if (!process.env.AUTH)
        dotenv.config({ path: './..' })

    const
        backupSocket = req.app.get('backupSocket')
        , ids = res.locals.fileIds
        , collection = res.locals.collection
        , filesMetadata = []
    let
        razaoSocial
        , placa

    if (!backupSocket) //cancela o backup se não houver socket definido
        return

    for (let id of ids) {
        let fileRequest
        if (collection === 'empresaDocs')
            fileRequest = await empresaModel.find(new mongoose.mongo.ObjectId(id))
        else
            fileRequest = await filesModel.find(new mongoose.mongo.ObjectId(id))
        //console.log("🚀 ~ file: permanentBackup.js ~ line 42 ~ permanentBackup ~ file", collection, fileRequest, ids, res.locals)

        if (fileRequest.length) {
            const
                file = fileRequest[0]
                , { metadata } = file

            if (!razaoSocial) {
                const fieldsToAdd = await addMetadata(metadata)
                razaoSocial = fieldsToAdd.razaoSocial
                placa = fieldsToAdd.placa
                empresaId = fieldsToAdd.codigoEmpresa
            }
            Object.assign(metadata, { empresaId, razaoSocial, placa })
            filesMetadata.push(file)
        }
    }
    backupSocket.emit('permanentBackup', filesMetadata)
}

module.exports = { permanentBackup }
