//@ts-check
const
    { request, response } = require('express')
    , VeiculoRepository = require("./VeiculoRepository")
    , userSockets = require('../../auth/userSockets')


class VeiculoController {

    /**
     * 
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<void>}
     */
    async list(req, res) {

        try {
            const
                { table, condition } = res.locals
                , veiculoRepository = new VeiculoRepository()
                , veiculos = await veiculoRepository.getVehicles(table, condition)
            res.status(200).json(veiculos)

        } catch (error) {
            console.log({ error: error.message })
            res.status(400).send(error)
        }
    }

    /**
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<void>}
     */
    async create(req, res) {

        try {
            const
                veiculoRepository = new VeiculoRepository()
                , veiculoId = await veiculoRepository.create(req.body)
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
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<void>}
     */
    async update(req, res) {

        const
            veiculoRepository = new VeiculoRepository()
            , { id } = req.body
            , condition = `WHERE veiculos.veiculo_id = '${id}'`
            , updateObject = { ...req.body, condition }
            , veiculoId = await veiculoRepository.update(updateObject)

        //@ts-ignore
        userSockets({ req, noResponse: true, table: 'veiculos', condition, event: 'updateVehicle' })
        res.send(JSON.stringify(veiculoId))
    }
}

module.exports = VeiculoController
