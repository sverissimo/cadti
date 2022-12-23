//@ts-check
const fs = require('fs')
const xlsx = require('xlsx')
const updateVehicleStatus = require("../taskManager/veiculos/updateVehicleStatus")
const oldVehiclesModel = require('../mongo/models/oldVehiclesModel')
const getFormattedDate = require('../utils/getDate')
const VeiculoRepository = require('../repositories/VeiculoRepository')
const { Repository } = require('../repositories/Repository')
const VeiculoDaoImpl = require('../infrastructure/VeiculoDaoImpl')

class VeiculoService {

    /**
     * Busca por um veículo entre ativos e baixados.
     * @param {string} placa
     */
    static checkVehicleExistence = async (placa) => {
        const veiculoAtivoSearch = await new VeiculoRepository().find({ placa: placa })
        const veiculoAtivo = veiculoAtivoSearch[0]
        let foundOne

        if (veiculoAtivo) {
            const { veiculo_id, placa, situacao } = veiculoAtivo
            const vehicleFound = { veiculoId: veiculo_id, placa, situacao }
            foundOne = { vehicleFound, status: 'existing' }
        }
        else {
            const dischargedQuery = { "Placa": { $in: [placa, placa.replace('-', '')] } }
            let old = await oldVehiclesModel.find(dischargedQuery).lean()

            if (old.length > 0) {
                foundOne = { vehicleFound: old[0], status: 'discharged' }
            }
        }
        if (!foundOne) {
            return false
        }
        return foundOne
    }

    /**
     * Busca por todos os veículos utilizados por uma empresa, seja próprio ou em compartilhado.
     * @param {*} codigoEmpresa
     */
    static getAllVehicles = async (codigoEmpresa) => {
        const seguros = await new Repository('seguros', 'id')
            .find({ codigo_empresa: codigoEmpresa })

        const allVehiclesUsedByEmpresa = await VeiculoDaoImpl.getAllVehicles(codigoEmpresa, seguros)
        return allVehiclesUsedByEmpresa
    }

    /**
    * @typedef {object} ApoliceUpdate
    * @property {string} apolice
    * @property {number[]} vehicleIds
    * @property {number[]} deletedVehicleIds
    * @param {ApoliceUpdate} apoliceUpdate
    */
    static async updateVehiclesInsurance(apoliceUpdate) {
        try {
            const result = await new VeiculoRepository().updateVehiclesInsurance(apoliceUpdate)
            if (result) {
                const { vehicleIds, deletedVehicleIds } = apoliceUpdate
                const ids = [...vehicleIds, ...deletedVehicleIds]
                await updateVehicleStatus(ids)
            }

            return result
        } catch (error) {
            throw new Error(error.message)
        }
    }

    static getOldVehiclesXls = async () => {
        try {
            const dischargedVehicles = await oldVehiclesModel.find().select('-__v -_id').lean()
            const currentDate = getFormattedDate()
            const fileName = `Veículos baixados - ${currentDate}.xlsx`
            const wb = xlsx.utils.book_new()
            const wb_opts = { bookType: 'xlsx', type: 'binary' }
            const ws = xlsx.utils.json_to_sheet(dischargedVehicles)

            xlsx.utils.book_append_sheet(wb, ws, 'Veículos baixados')
            //@ts-ignore
            xlsx.writeFile(wb, fileName, wb_opts);

            const stream = fs.createReadStream(fileName);
            return { fileName, stream }
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = { VeiculoService }
