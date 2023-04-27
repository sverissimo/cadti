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
        const razaoSocial = await FileService._getRazaoSocial(files[0].metadata)
        const filesMetadata = files.map(f => ({
            ...f,
            length: f.size,
            metadata: {
                ...f.metadata,
                razaoSocial,
                fieldName: f.metadata.fieldName || f.fieldname
            }
        }))
        return filesMetadata
    }

    /**
    * @param {object} metadata
    * @returns {Promise<string>}
    */
    static _getRazaoSocial = async (metadata) => {
        const { empresaId, veiculoId } = metadata
        if (empresaId) {
            const codigo_empresa = parseInt(metadata.empresaId)
            const empresasFound = await new Repository('empresas', 'codigo_empresa').find(codigo_empresa)
            const { razao_social: razaoSocial } = empresasFound[0]
            return razaoSocial
        }
        if (veiculoId) {
            const veiculo_id = parseInt(metadata.veiculoId)
            const veiculosFound = await new Repository('veiculos', 'veiculo_id').find(veiculo_id)
            const { placa, codigo_empresa, empresa: razaoSocial } = veiculosFound[0]
            metadata.empresaId = codigo_empresa
            metadata.placa = placa

            return razaoSocial
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
