const
    { default: axios } = require('axios')
    , { request, response } = require('express')
    , mongoose = require('mongoose')
    , { empresaModel } = require('../mongo/models/empresaModel')
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
        , filesMetadata = []
    let
        razaoSocial
        , placa


    for (let id of ids) {
        let fileRequest
        //if (process.env.NODE_ENV === 'production')
        fileRequest = await empresaModel.find(new mongoose.mongo.ObjectId(id))

        /* else
            fileRequest = await axios.get(`http://200.198.42.167/api/mongoDownload?id=${id}&collection=empresaDocs`
                , {
                    headers: {
                        Authorization: process.env.AUTH || 'mengo'
                    }
                })
        console.log("🚀 ~ file: permanentBackup.js ~ line 42 ~ permanentBackup ~ file", fileRequest) */
        if (fileRequest.length) {
            const
                file = fileRequest[0]
                , { metadata } = file
            if (!razaoSocial) {
                const fieldsToAdd = await addMetadata(metadata)
                razaoSocial = fieldsToAdd.razaoSocial
                placa = fieldsToAdd.placa
            }
            Object.assign(metadata, { razaoSocial, placa })
            file.id = '60632acbde5f8a1a2cd76a2c'
            filesMetadata.push(file)
        }
    }
    backupSocket.emit('permanentBackup', filesMetadata)
}

module.exports = { permanentBackup }
