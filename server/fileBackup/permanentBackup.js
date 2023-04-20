//@ts-check
const { empresaModel } = require('../mongo/models/empresaModel')
const { filesModel } = require('../mongo/models/filesModel')
const { addMetadata } = require('./addMetadata')

/**
 * @param {string[]} ids
 * @param {string} collection
 * @returns {Promise<void>}
 */
const permanentBackup = async (ids, collection, backupSocket) => {

    if (!backupSocket) {
        return
    }

    const filesMetadata = []
    const entityManager = collection === 'empresaDocs' ? empresaModel : filesModel
    for (const id of ids) {
        const file = await entityManager.findById(id)
        if (!file) continue

        const { metadata } = file
        const { razaoSocial, placa, codigoEmpresa } = await addMetadata(metadata)
        Object.assign(metadata, { razaoSocial, placa, codigoEmpresa })
        filesMetadata.push(file)
    }
    console.log("🚀 ~ file: permanentBackup.js:27 ~ permanentBackup ~ filesMetadata:", filesMetadata)

    backupSocket.to('backupService').emit('permanentBackup', filesMetadata)
    return
}

module.exports = { permanentBackup }
