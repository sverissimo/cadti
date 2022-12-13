//@ts-check
const { request, response } = require("express")
const { Controller } = require("./Controller")
const { Repository } = require("../repositories/Repository")
const { SeguroService } = require("../services/SeguroService")

class SeguroController extends Controller {

    constructor(table, primaryKey, repository) {
        super()
        this.table = this.table || table
        this.primaryKey = this.primaryKey || primaryKey
        this.repository = repository || new Repository(this.table, this.primaryKey)
    }

    /**
     * @param {request} req
     * @param {response} res
     * @returns {Promise<any>}
     */
    updateInsurance = async (req, res, next) => {
        const { update, vehicleIds, deletedVehicleIds } = req.body
        try {
            const updated = await SeguroService.updateInsurance({ update, vehicleIds, deletedVehicleIds })
            const { updatedInsurance, updatedVehicles } = updated
            //REFACTOR: SEM FILTRO DE USUÁRIOS!!!!!!!!
            const io = req.app.get('io')
            io.sockets.emit('updateAny', {
                data: updatedInsurance,
                collection: 'seguros',
                primaryKey: 'id',
            })
            io.sockets.emit('updateAny', {
                data: updatedVehicles,
                collection: 'veiculos',
                primaryKey: 'veiculo_id',
            })

            return res.status(200).send('Seguro e veículos atualizados.')
        } catch (error) {
            next(error)
        }
    }
}

module.exports = { SeguroController }
