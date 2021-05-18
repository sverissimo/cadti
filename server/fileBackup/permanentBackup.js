//@ts-check
const { request, response } = require('express')
const mongoose = require('mongoose')
const { empresaModel } = require('../mongo/models/empresaModel')

/**
 * 
 * @param {request} req 
 * @param {response} res
 */
const permanentBackup = async (req, res) => {
    const
        backupSocket = req.app.get('backupSocket')
        , ids = res.locals.fileIds
        , files = []

    for (let id of ids) {
        const a = await empresaModel.find(new mongoose.mongo.ObjectId(id))
        a[0] && files.push(a[0])
    }
    backupSocket.emit('permanentBackup', files)
}

module.exports = { permanentBackup }
