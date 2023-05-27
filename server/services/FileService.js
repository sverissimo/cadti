//@ts-check
const mongoose = require('mongoose')
const { empresaChunks, vehicleChunks } = require('../mongo/models/chunksModel')
const { filesModel } = require('../mongo/models/filesModel')
const { Repository } = require('../repositories/Repository')
const { empresaModel } = require('../mongo/models/empresaModel')

class FileService {

    /**@property {mongoose.model} model*/
    model;

    /**@property {mongoose.model} model*/
    chunks;

    /**@param {string} collection */
    constructor(collection) {
        this.collection = collection
        this.model = collection === 'empresaDocs' ? empresaModel : filesModel
        this.chunks = collection === 'empresaDocs' ? empresaChunks : vehicleChunks
    }

    /**
    * @param {string} id
    * @param {any} gfs
    * @returns {Promise<object|null>}
    */
    download = async (id, gfs) => {
        const _id = new mongoose.mongo.ObjectId(id)

        gfs.collection(this.collection)
        const file = await gfs.files.findOne({ _id })
        if (!file) {
            return null
        }
        const fileStream = gfs.createReadStream({ filename: file.filename })
        return { file, fileStream }
    }

    getFileMetadata = async (filter) => {
        const file = await this.model.findOne(filter)
        return file
    }

    /**
    * @param {object} inputObject
    * @returns {Promise<object[]>}
    */
    getFilesMetadata = async ({ user, fieldName = '' }) => {
        const { empresas, role } = user
        if (role === 'empresas' && !empresas.length) {
            return []
        }

        const filter = {}
        const fieldObject = fieldName ? { 'metadata.fieldName': fieldName } : {}

        if (role === 'empresa') {
            if (this.collection === 'empresaDocs')
                Object.assign(filter, { 'metadata.empresaId': { $in: empresas } })
            else {
                const result = await new Repository('veiculos', 'veiculo_id').find({ codigo_empresa: empresas })
                const frota = result.map(v => v.veiculo_id)
                Object.assign(filter, { 'metadata.veiculoId': { $in: frota } })
            }
        }

        const files = await this.model.find({ ...filter, ...fieldObject }).sort({ uploadDate: -1 })
        return files
    }

    /**
     * @param {any[]} files
     * @returns {Promise<object[]>}
    */
    static createBackupMetadata = async (files) => {
        const additionalMetadata = await FileService._getPlacaAndEmpresa(files[0].metadata)
        const filesMetadata = files.map(f => ({
            ...f,
            length: f.size || f.length,
            metadata: {
                ...f.metadata,
                ...additionalMetadata,
            }
        }))
        return filesMetadata
    }

    /**
     * @param {string[]}  ids
     * @param {object}  metadata
     * @returns {Promise<object[]|boolean> }
     */
    updateFilesMetadata = async (ids, metadata) => {
        const update = Object.keys(metadata)
            .map(key => ({
                ['metadata.' + key]: metadata[key]
            }))
            .reduce((prev, curr) => ({ ...prev, ...curr }), {})

        const filter = { "_id": { $in: ids } }
        const result = await this.model.updateMany(
            filter,
            { "$set": update }
        )
        console.log("🚀 ~ file: FileService.js:107 ~ FileService ~ updateFilesMetadata= ~ result:", result)

        const { n, nModified } = result
        if (!!!nModified && !n) {
            return false
        }

        const updatedDocs = await this.model.find(filter).lean()
        return updatedDocs
    }

    /**
    * @param {object} metadata
    * @returns {Promise<object>}
    */
    static _getPlacaAndEmpresa = async (metadata) => {
        const { empresaId, veiculoId } = metadata
        if (empresaId) {
            const codigo_empresa = parseInt(metadata.empresaId)
            const empresasFound = await new Repository('empresas', 'codigo_empresa').find(codigo_empresa)
            const { razao_social: razaoSocial } = empresasFound[0]
            return { razaoSocial }
        }
        if (veiculoId) {
            const veiculo_id = parseInt(metadata.veiculoId)
            const veiculosFound = await new Repository('veiculos', 'veiculo_id').find(veiculo_id)
            const { placa, codigo_empresa: empresaId, empresa: razaoSocial } = veiculosFound[0]

            return { razaoSocial, empresaId, placa }
        }
        return ''
    }

    /**
     * @param {string[]} ids
     * @returns {Promise<object>}
    */
    deleteFile = async (ids) => {
        const deletedFiles = await this.model.deleteMany({ _id: { $in: ids } })
        const deletedChunks = await this.chunks.deleteMany({ files_id: { $in: ids.map(id => new mongoose.mongo.ObjectId(id)) } })

        return { deletedFiles, deletedChunks }
    }
}

module.exports = { FileService }
