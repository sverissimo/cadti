//@ts-check
const fs = require('fs')
const xlsx = require('xlsx')
const moment = require('moment')
const VeiculoDaoImpl = require('../infrastructure/VeiculoDaoImpl')
const oldVehiclesModel = require('../mongo/models/oldVehiclesModel')
const getFormattedDate = require('../utils/getDate')
const VeiculoRepository = require('../repositories/VeiculoRepository')
const { Repository } = require('../repositories/Repository')

class VeiculoService {

    static repository = new VeiculoRepository()
    static entityManager = new VeiculoDaoImpl()
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
    * @property {number[]} [vehicleIds]
    * @property {number[]} [deletedVehicleIds]
    * @param {ApoliceUpdate} apoliceUpdate
    */
    static updateVehiclesInsurance = async (apoliceUpdate) => {
        try {
            const result = await this.repository.updateVehiclesInsurance(apoliceUpdate)
            if (result) {
                const { vehicleIds, deletedVehicleIds } = apoliceUpdate
                const ids = []
                if (vehicleIds) {
                    ids.push(...vehicleIds)
                }
                if (deletedVehicleIds) {
                    ids.push(...deletedVehicleIds)
                }
                await this.updateVehicleStatus(ids)
            }

            return result
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * Atualiza o status de todos os veículos ou de um grupo específico, caso seja passada uma array de IDs
     * @param {number[]} [ids]
     * @returns {Promise<boolean>} Resultado do update - boolean
     */
    static updateVehicleStatus = async (ids) => {
        try {
            const vehicleFilter = ids || ''
            const veiculos = await this.repository.find(vehicleFilter)
            const updatedStatus = await this._getUpdatedVehicleStatus(veiculos)
            const result = await this.repository.updateMany(updatedStatus)
            return result
        } catch (error) {
            throw new Error(error)
        }
    }

    /**
     * @param {Array<object>} veiculos
     * @returns {Promise<any[]>} Array de objetos con veiculo_id e situacao
     */
    static _getUpdatedVehicleStatus = async (veiculos) => {
        const laudos = await new Repository('laudos', 'id').list()
        const currentDate = new Date()
        const updates = []

        for (const v of veiculos) {
            const update = { id: v.veiculo_id }
            const validDate = v.vencimento && moment(v.vencimento).isValid()
            const insuranceExpired = moment(v.vencimento).isBefore(moment(), 'day')
            const noInsurance = v.apolice === 'Seguro não cadastrado'
            const isOld = currentDate.getFullYear() - v.ano_carroceria >= 16
            const laudoExpired = laudos.find(l => (
                l.veiculo_id === v.veiculo_id
                && moment(l.validade).isBefore(moment(), 'day')
            ))

            const seguroVencido = (validDate && insuranceExpired) || noInsurance
            const laudoVencido = isOld && laudoExpired

            if (seguroVencido && laudoVencido) {
                update.situacao = 'Ambos seguro e laudo vencidos'
            }
            else if (seguroVencido) {
                update.situacao = 'Seguro vencido'
            }
            else if (laudoVencido) {
                update.situacao = 'Laudo inexistente ou vencido'
            }
            else {
                update.situacao = 'Ativo'
            }
            if (v.situacao !== update.situacao) {
                updates.push(update)
            }
        }

        const ativos = updates.filter(u => u.situacao === 'Ativo').length
        const segurosVencidos = updates.filter(u => u.situacao === 'Seguro Vencido').length
        const laudosVencidos = updates.filter(u => u.situacao === 'Laudo inexistente ou vencido').length
        const ambosVencidos = updates.filter(u => u.situacao === 'Ambos seguro e laudo vencidos').length
        console.log('Vehicle update status result: ', { ativos, segurosVencidos, laudosVencidos, ambosVencidos })
        return updates
    }

    /**
     * @param {object} laudo
     * @returns {Promise<string|number>} laudoId
     */
    static addLaudo = async (laudo) => {
        try {
            const repository = await new Repository('laudos', 'id')
            const createdId = await repository.save(laudo)
            const { veiculo_id } = laudo

            await this.updateVehicleStatus([veiculo_id])
            return createdId
        } catch (error) {
            throw new Error(error)
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
