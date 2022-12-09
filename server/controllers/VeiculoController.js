//@ts-check
const { request, response } = require('express')
const VeiculoRepository = require("../repositories/VeiculoRepository")
const userSockets = require('../auth/userSockets')
const { Controller } = require('./Controller')
const oldVehiclesModel = require('../mongo/models/oldVehiclesModel')
const { VeiculoService } = require('../services/VeiculoService')

/** @class */
class VeiculoController extends Controller {

    /**
     * @param {request} req
     * @param {response} res
     * @returns {Promise<void | res>}
     */
    async create(req, res, next) {
        const veiculo = req.body
        try {
            const veiculoRepository = new VeiculoRepository()
            const exists = await veiculoRepository.find({ placa: veiculo.placa })

            if (exists.length) {
                return res.status(409).send('A placa informada já está cadastrada no sistema.')
            }

            const veiculoId = await veiculoRepository.create(veiculo)
            const condition = `WHERE veiculos.veiculo_id = '${veiculoId}'`

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

            res.status(201).send(String(veiculoId))
        } catch (error) {
            next(error)
        }
    }

    /**
     * @override
     * @param {request} req
     * @param {response} res
     * @returns {Promise<void | res>}
     */
    update = async (req, res, next) => {
        const veiculoRepository = new VeiculoRepository()
        const { codigoEmpresa, ...veiculo } = req.body
        const condition = `WHERE veiculos.veiculo_id = '${req.body.veiculo_id}'`

        if (Object.keys(veiculo).length <= 1)
            return res.status(409).send('Nothing to update...')

        try {
            const exists = await veiculoRepository.find(req.body.veiculo_id)
            if (!exists.length)
                return res.status(409).send('Veículo não cadastrado na base de dados.')

            const veiculoId = await veiculoRepository.update(veiculo)
            res.send(JSON.stringify(veiculoId))
        } catch (error) {
            console.log("🚀 ~ file: VeiculoController.js ~ line 72 ~ VeiculoController ~ update= ~ error", error)
            throw error
        }
        //@ts-ignore
        userSockets({ req, noResponse: true, table: 'veiculos', condition, event: 'updateVehicle' })
    }

    getAllVehicles = async (req, res, next) => {
        try {
            const { codigoEmpresa } = req.query
            if (!codigoEmpresa) {
                return res.status(400).send('Código da empresa obrigatório para esse request.')
            }

            const allVehiclesUsedByEmpresa = await VeiculoService.getAllVehicles(codigoEmpresa)
            return res.send(allVehiclesUsedByEmpresa)
        } catch (error) {
            next(error)
        }
    }

    getOldVehicles = async (req, res, next) => {

        if (!req.query.placa) {
            return res.status(400).send('É obrigatório informar a placa para essa consulta.')
        }
        const placa = req.query.placa.toUpperCase()
        const query = { "Placa": { $in: [placa, placa.replace('-', '')] } }
        const result = await oldVehiclesModel.find(query).exec()
        res.send(result)
    }

    /**
     * Busca pela placa e altera um registro da coleção OldVehicles no mongoDB
     * A alteração é no atributo "Situação" que passa de 'Baixado' para 'Reativado'
     */
    reactivateVehicle = async (req, res) => {
        if (!req.body.placa && !req.body.Placa) {
            return res.status(400).send('É obrigatório informar a placa para essa solicitação.')
        }

        const { placa, Placa } = req.body
        const filter = { Placa: placa || Placa }
        const update = { 'Situação': 'Reativado' }

        //@ts-ignore
        oldVehiclesModel.findOneAndUpdate(filter, update, (err, doc) => {
            if (err)
                console.log(err)
            else
                res.send('Veículo reativado.')
        })
    }

    baixaVeiculo = async (req, res) => {
        if (!req.body.placa && !req.body.Placa) {
            return res.status(400).send('É obrigatório informar a placa para a baixa.')
        }
        const { placa, Placa, ...update } = req.body
        const filter = { Placa: Placa || placa }

        oldVehiclesModel.findOneAndUpdate(
            filter,
            update,
            { upsert: true, new: true },
            (err, doc) => {
                if (err) {
                    console.log(err)
                    return res.status(500).send(err.message)
                }
                res.send(doc)
            }
        )
    }

    /** Pesquisa entre veículos ativos e baixados */
    checkVehicleExistence = async (req, res, next) => {
        const { placa } = req.query
        try {
            const vehicleFound = await VeiculoService.checkVehicleExistence(placa)

            if (!vehicleFound) {
                return res.send('Veículo não encontrado.')
            }
            return res.send(vehicleFound)
        } catch (error) {
            next(error)
        }
    }

    getOldVehiclesXls = async (req, res, next) => {
        const { user } = req

        if (!user || user.role === 'empresa') {
            res.status(403).send('Não há permissão para esse usuário acessar essa parte do CadTI.')
        }
        try {
            const { fileName, stream } = await VeiculoService.getOldVehiclesXls()

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
            stream.on('end', () => res.end());
            stream.pipe(res)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = VeiculoController
