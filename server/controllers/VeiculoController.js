//@ts-check
const
    { request, response } = require('express')
    , VeiculoRepository = require("../repositories/VeiculoRepository")
    , userSockets = require('../auth/userSockets')
    , { Controller } = require('./Controller')

/**
 * @class 
 */
class VeiculoController extends Controller {


    /**
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<void | res>}
     */
    async create(req, res) {
        const veiculo = req.body
        try {
            const veiculoRepository = new VeiculoRepository()
                , exists = await veiculoRepository.find({ placa: veiculo.placa })

            if (exists.length)
                return res.status(409).send('A placa informada já está cadastrada no sistema.')

            const veiculoId = await veiculoRepository.create(veiculo)
                , condition = `WHERE veiculos.veiculo_id = '${veiculoId}'`

            //@ts-ignore
            //Atualiza os dados no frontEnd por meio de webSockets
            userSockets({
                req,
                table: 'veiculos',
                event: 'insertVehicle',
                condition,
                veiculo_id: veiculoId,
                noResponse: true
            })

            res.status(201).send(JSON.stringify(veiculoId))

        } catch (error) {
            console.error("🚀 ~ file: VeiculoController.js ~ line 64 ~ VeiculoController ~ create ~ error", error)
            res.status(500).send(error.message)
        }
    }


    /**
     * @override
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<void>}
     */
    update = async (req, res) => {

        const
            veiculoRepository = new VeiculoRepository()
            , { codigoEmpresa, ...veiculo } = req.body
            , condition = `WHERE veiculos.veiculo_id = '${req.body.veiculo_id}'`
            , veiculoId = await veiculoRepository.update(veiculo)

        //@ts-ignore
        userSockets({ req, noResponse: true, table: 'veiculos', condition, event: 'updateVehicle' })
        res.send(JSON.stringify(veiculoId))
    }
}

module.exports = VeiculoController
