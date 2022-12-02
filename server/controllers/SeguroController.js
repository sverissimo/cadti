//@ts-check
const
    { request, response } = require("express")
    , { EmpresaDaoImpl } = require("../infrastructure/EmpresaDaoImpl")
    , { Controller } = require("./Controller")
    , { Repository } = require("../repositories/Repository")
    , { CustomSocket } = require("../sockets/CustomSocket")
const { pool } = require("../config/pgConfig")
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
     * @override
     */
    save = async (req, res) => {

        let parsed = []

        const keys = Object.keys(req.body).toString(),
            values = Object.values(req.body)

        values.forEach(v => {
            parsed.push(('\'' + v + '\''))
        })
        //@ts-ignore
        parsed = parsed.toString().replace(/'\['/g, '').replace(/'\]'/g, '')
        pool.query(
            `INSERT INTO public.seguros (${keys}) VALUES (${parsed}) RETURNING *`, (err, table) => {
                if (err)
                    console.log(err)
                if (table && table.rows && table.rows.length === 0)
                    return res.send(table.rows)
                if (table && table.rows.length > 0)
                    res.send('Seguro cadastrado.')
            })
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
            res.status(500).send(error)
        }
    }
}

module.exports = { SeguroController }
