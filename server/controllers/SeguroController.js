//@ts-check
const { request, response } = require("express")
const { Controller } = require("./Controller")
const { SeguroService } = require("../services/SeguroService")
const { CustomSocket } = require("../sockets/CustomSocket")
const { Repository } = require("../repositories/Repository")

class SeguroController extends Controller {

    table = 'seguros'
    primaryKey = 'id'
    repository = new Repository(this.table, this.primaryKey)

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
            res.status(200).send('Seguro e veículos atualizados.')
            //@ts-ignore
            const codigoEmpresa = updatedInsurance.codigo_empresa || updatedVehicles.codigo_empresa
            const io = req.app.get('io')

            if (updatedInsurance) {
                const seguroSocket = new CustomSocket(io, this.table, this.primaryKey)
                seguroSocket.emit('updateAny', updatedInsurance, codigoEmpresa)
            }

            if (updatedInsurance) {
                const veiculoSocket = new CustomSocket(io, 'veiculos', 'veiculo_id')
                veiculoSocket.emit('updateAny', updatedVehicles, codigoEmpresa)
            }


        } catch (error) {
            next(error)
        }
    }
}

module.exports = { SeguroController }
