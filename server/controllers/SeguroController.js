//@ts-check
const { request, response } = require("express")
const { Controller } = require("./Controller")
const { Repository } = require("../repositories/Repository")
const { SeguroService } = require("../services/SeguroService")
const { CustomSocket } = require("../sockets/CustomSocket")

class SeguroController extends Controller {

    constructor(repository) {
        super()
        this.table = 'seguros'
        this.primaryKey = 'id'
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
            //@ts-ignore
            const codigoEmpresa = updatedInsurance.codigo_empresa || updatedVehicles.codigo_empresa
            const io = req.app.get('io')

            if (updatedInsurance) {
                const seguroSocket = new CustomSocket(io, this.table)
                seguroSocket.emit('updateAny', updatedInsurance, codigoEmpresa, this.primaryKey)
            }

            if (updatedInsurance) {
                const veiculoSocket = new CustomSocket(io, 'veiculos')
                veiculoSocket.emit('updateAny', updatedVehicles, codigoEmpresa, 'veiculo_id',)
            }

            return res.status(200).send('Seguro e veículos atualizados.')
        } catch (error) {
            next(error)
        }
    }
}

module.exports = { SeguroController }
