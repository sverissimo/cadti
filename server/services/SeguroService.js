//@ts-check
const { SeguroDaoImpl } = require("../infrastructure/SeguroDaoImpl")
const segurosModel = require("../mongo/models/segurosModel")
const VeiculoRepository = require("../repositories/VeiculoRepository")

class SeguroService {

    /** @returns {Promise<object>} updatedInsurance, updatedVehicles */
    static updateInsurance = async ({ update, vehicleIds, deletedVehicleIds }) => {
        const seguroDao = new SeguroDaoImpl()
        const veiculoRepository = new VeiculoRepository()

        try {
            const insuranceQueryResult = await seguroDao.update(update)
            const vehiclesToUpdate = vehicleIds
                .map(veiculo_id => ({
                    veiculo_id,
                    apolice: update.apolice,
                }))
                .filter(v => !!v.veiculo_id)
            const vehiclesToRemoveInsurance = deletedVehicleIds
                .map(veiculo_id => ({
                    veiculo_id,
                    apolice: 'Seguro não cadastrado'
                }))
                .filter(v => !!v.veiculo_id)

            const vehicleUpdates = vehiclesToUpdate.concat(vehiclesToRemoveInsurance)
            const vehicleQueryResult = await veiculoRepository.updateMany(vehicleUpdates)

            let updatedInsurance, updatedVehicles

            if (insuranceQueryResult) {
                updatedInsurance = await seguroDao.find(update.id)
            }

            if (vehicleQueryResult) {
                const allVehicleIds = [...vehicleIds, ...deletedVehicleIds]
                updatedVehicles = await veiculoRepository.find(allVehicleIds)
            }

            return { updatedInsurance, updatedVehicles }
        } catch (error) {
            throw new Error(error)
        }
    }

    static saveUpComingInsurances = (req, res) => {
        const { user, body } = req
        const role = user && user.role
        const segModel = new segurosModel(body)

        if (role === 'empresa')
            return res.status(403).send('O usuário não possui permissões para esse cadastro no cadTI.')

        segModel.save(function (err, doc) {
            if (err) console.log(err)
            if (doc) res.locals = { doc }
            res.send('saved in mongoDB')
        })
    }
}

module.exports = { SeguroService }
