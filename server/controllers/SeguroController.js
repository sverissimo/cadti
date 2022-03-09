//@ts-check
const
    { request, response } = require("express")
    , { EmpresaDaoImpl } = require("../infrastructure/EmpresaDaoImpl")
    , { Controller } = require("./Controller")
    , { Repository } = require("../repositories/Repository")
    , { CustomSocket } = require("../sockets/CustomSocket")
const { EntityDaoImpl } = require("../infrastructure/EntityDaoImpl")
const { SeguroDaoImpl } = require("../infrastructure/SeguroDaoImpl")
const VeiculoRepository = require("../repositories/VeiculoRepository")


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
    updateInsurance = async (req, res) => {

        const
            vehicleIds = req.body.vehicleIds || []
            , deletedVehicles = req.body.deletedVehicles || []
            , { update } = req.body
            , { id } = update

        try {

            const entityManager = new SeguroDaoImpl()
            await entityManager.updateInsurance(req.body)

            const
                allUpdatedVehicleIds = vehicleIds.concat(deletedVehicles)
                , updatedVehicles = await new Repository('veiculos', 'veiculo_id').find(allUpdatedVehicleIds)
                , { codigo_empresa } = updatedVehicles[0]
                , veiculoSocket = new CustomSocket(req)

            veiculoSocket.emit('updateAny', updatedVehicles, 'veiculos', 'veiculo_id', codigo_empresa)

            const
                updatedInsurance = await new Repository('seguros', 'id').find(id)
                , seguroSocket = new CustomSocket(req)

            await seguroSocket.emit('updateAny', updatedInsurance, 'seguros', 'id', codigo_empresa)

            return res.status(200).send('Seguro e veículos atualizados.')

        } catch (error) {
            console.log("🚀 ~ file: EmpresaController.js ~ line 30 ~ EmpresaController ~ saveEmpresaAndSocios ~ error", error)
            res.status(500).send(error)
        }
    }
}

module.exports = { SeguroController }
