//@ts-check
const { SeguroDaoImpl } = require("../infrastructure/SeguroDaoImpl")
const { getUpdatedData } = require('../infrastructure/SQLqueries/getUpdatedData')
const segurosModel = require("../mongo/models/segurosModel")
const { Repository } = require("../repositories/Repository")
const VeiculoRepository = require("../repositories/VeiculoRepository")
const { VeiculoService } = require("./VeiculoService")

class SeguroService {

    /**
     * @param {object} seguroDTO
     */
    static save = async (seguroDTO) => {
        const seguroDao = new SeguroDaoImpl()
        const veiculoRepository = new VeiculoRepository()
        try {
            const { veiculos: veiculoIds, ...seguro } = seguroDTO
            const { apolice } = seguro
            const seguroId = await seguroDao.save(seguro)
            const vehicleUpdateResult = await VeiculoService.updateVehiclesInsurance({
                apolice,
                vehicleIds: veiculoIds
            })

            let updatedVehicles
            if (vehicleUpdateResult) {
                updatedVehicles = await veiculoRepository.find(veiculoIds)
            }

            const updatedInsurance = await seguroDao.find(seguroId)
            return {
                updatedInsurance,
                updatedVehicles
            }

        } catch (error) {
            throw new Error(error)
        }
    }

    /**
     * **
    * @typedef {object} SeguroUpdate
    * @property {object} update
    * @property {number[]} [vehicleIds]
    * @property {number[]} [deletedVehicleIds]
    * @param {SeguroUpdate} apoliceUpdate
    * @returns {Promise<object>} updatedInsurance, updatedVehicles
    */
    static updateInsurance = async ({ update, vehicleIds = [], deletedVehicleIds = [] }) => {
        const seguroDao = new SeguroDaoImpl()
        const veiculoRepository = new VeiculoRepository()

        try {
            const insuranceQueryResult = await seguroDao.update(update)
            const { apolice } = update
            const vehicleQueryResult = await VeiculoService.updateVehiclesInsurance({ apolice, vehicleIds, deletedVehicleIds })
            let updatedInsurance
            let updatedVehicles

            if (insuranceQueryResult) {
                updatedInsurance = await seguroDao.find(update.id)
            }

            if (vehicleQueryResult) {
                const allVehicleIds = [...vehicleIds, ...deletedVehicleIds]
                updatedVehicles = await veiculoRepository.find(allVehicleIds)
            }

            return {
                updatedInsurance,
                updatedVehicles
            }

        } catch (error) {
            throw new Error(error)
        }
    }

    /**
     * Procura seguros vencidos e atualiza seus status
     * @returns Promise<boolean>
     */
    static checkExpiredInsurances = async () => {
        try {
            const condition = 'WHERE seguros.vencimento < current_date'
            const segurosVencidos = await getUpdatedData('seguros', condition)
            const updates = segurosVencidos
                .filter(s => s.situacao !== 'Vencido')
                .map(s => ({ id: s.id, situacao: 'Vencido' }))

            const seguroDao = new SeguroDaoImpl()
            const updateResult = await seguroDao.updateMany(updates)
            return updateResult
        } catch (error) {
            throw new Error(error)
        }
    }

    static insertNewInsurances = async () => {
        try {
            const today = new Date()
            const upcomingInsurances = await segurosModel.find({
                data_emissao: { $lte: today },
                vencimento: { $gte: today }
            }).lean().exec()

            if (!upcomingInsurances.length) {
                console.log("SeguroService >> insertNewInsurances->false. No insurances to update.")
                return false
            }

            const seguroRepository = new Repository('seguros', 'id')
            const seguros = await seguroRepository.list()
            const segurosToUpdate = upcomingInsurances.filter(({ apolice }) => seguros.some(s => s.apolice === apolice))
            const segurosToAdd = upcomingInsurances.filter(({ apolice }) => seguros.every(s => s.apolice !== apolice))

            if (segurosToUpdate.length) {
                for (const seguroUpdate of segurosToUpdate) {
                    const { veiculos: veiculoUpdates } = seguroUpdate
                    const { id, veiculos: oldListOfVehicles } = seguros.find(s => s.apolice === seguroUpdate.apolice)

                    const veiculosToAdd = veiculoUpdates.filter(v => !oldListOfVehicles.includes(v))
                    const veiculosToDelete = oldListOfVehicles.filter(v => !veiculoUpdates.includes(v))
                    seguroUpdate.id = id
                    const seguroModel = this._convertToModel(seguroUpdate)

                    await new SeguroDaoImpl().update(seguroModel)
                    await VeiculoService.updateVehiclesInsurance({
                        apolice: seguroUpdate.apolice,
                        vehicleIds: veiculosToAdd,
                        deletedVehicleIds: veiculosToDelete
                    })
                }
            }

            if (segurosToAdd.length) {
                for (const seguro of segurosToAdd) {
                    const veiculos = seguro.veiculos || []
                    const seguroModel = this._convertToModel(seguro)

                    await seguroRepository.save(seguroModel)
                    await VeiculoService.updateVehiclesInsurance({
                        apolice: seguro.apolice,
                        vehicleIds: veiculos
                    })
                }
            }

            const cleanUpIDs = upcomingInsurances.map(({ _id }) => _id)
            const filter = { _id: { $in: cleanUpIDs } }
            const cleanUpResult = await segurosModel.deleteMany(filter)
            return cleanUpResult

        } catch (error) {
            throw new Error(error)
        }
    }

    static _convertToModel = (seguroDTO) => {
        const {
            _id,
            __v,
            veiculos,
            createdAt,
            updatedAt,
            ...seguroModel
        } = seguroDTO

        seguroModel.data_emissao = seguroModel.data_emissao.toISOString()
        seguroModel.vencimento = seguroModel.vencimento.toISOString()

        return seguroModel
    }
}

module.exports = { SeguroService }
