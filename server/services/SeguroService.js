//@ts-check
const { SeguroDaoImpl } = require("../infrastructure/SeguroDaoImpl")
const { getUpdatedData } = require('../infrastructure/SQLqueries/getUpdatedData')
const segurosModel = require("../mongo/models/segurosModel")
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

    /** @returns {Promise<object>} updatedInsurance, updatedVehicles */
    static updateInsurance = async ({ update, vehicleIds, deletedVehicleIds }) => {
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

    static saveUpComingInsurances = (req, res) => {
        const { user, body } = req
        const role = user && user.role
        const segModel = new segurosModel(body)

        if (role === 'empresa') {
            return res.status(403).send('O usuário não possui permissões para esse cadastro no cadTI.')
        }

        segModel.save(function (err, doc) {
            if (err) console.log(err)
            if (doc) res.locals = { doc }
            res.send('saved in mongoDB')
        })
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
}

module.exports = { SeguroService }
