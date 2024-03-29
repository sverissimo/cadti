//@ts-check
const { request, response } = require('express')
const { Controller } = require('./Controller')
const { VeiculoService } = require('../services/VeiculoService')
const VeiculoRepository = require("../repositories/VeiculoRepository")
const oldVehiclesModel = require('../mongo/models/oldVehiclesModel')
const { CustomSocket } = require('../sockets/CustomSocket')
const { Repository } = require('../repositories/Repository')

class VeiculoController extends Controller {

    constructor() {
        super('veiculos', 'veiculo_id')
        this.repository = new VeiculoRepository()
    }
    /**
     * @param {request} req
     * @param {response} res
     * @returns {Promise<void | res>}
     */
    async create(req, res, next) {
        const veiculo = req.body
        const { codigo_empresa: codigoEmpresa } = veiculo
        try {
            const exists = await this.repository.find({ placa: veiculo.placa })

            if (exists.length) {
                return res.status(409).send('A placa informada já está cadastrada no sistema.')
            }

            const veiculoId = await this.repository.create(veiculo)
            const io = req.app.get('io')
            const veiculoSocket = new CustomSocket(io, this.table, this.primaryKey)
            const updatedVeiculo = await this.repository.find(veiculoId)

            veiculoSocket.emit('insertElements', updatedVeiculo, codigoEmpresa)
            res.status(201).json(veiculoId)
        } catch (error) {
            next(error)
        }
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

    addLaudo = async (req, res, next) => {
        const laudo = req.body
        const { id, codigo_empresa, veiculo_id } = laudo
        if (!veiculo_id || !id) {
            return res.status(422).end()
        }
        const laudoId = await VeiculoService.addLaudo(laudo)
            .catch(err => next(err))

        const savedElement = await new Repository('laudos', 'id').find(laudoId)
        const updatedVehicle = await this.repository.find(veiculo_id)
        const io = req.app.get('io')
        const socket = new CustomSocket(io, 'laudos', 'id')
        const vehicleSocket = new CustomSocket(io, this.table, this.primaryKey)

        socket.emit('insertElements', savedElement, codigo_empresa)
        vehicleSocket.emit('updateAny', updatedVehicle, codigo_empresa)
        return res.status(201).send(laudoId)
    }

    getOldVehicles = async (req, res, next) => {
        if (!req.query.placa) {
            return res.status(400).send('É obrigatório informar a placa para essa consulta.')
        }
        try {
            const placa = req.query.placa.toUpperCase()
            const query = { "Placa": { $in: [placa, placa.replace('-', '')] } }
            const result = await oldVehiclesModel.find(query).exec()
            res.send(result)
        } catch (error) {
            next(error)
        }
    }

    /**
     * Busca pela placa e altera um registro da coleção OldVehicles no mongoDB
     * A alteração é no atributo "Situação" que passa de 'Baixado' para 'Reativado'
     */
    reactivateVehicle = async (req, res, next) => {
        if (!req.body.placa && !req.body.Placa) {
            return res.status(400).send('É obrigatório informar a placa para essa solicitação.')
        }

        const { placa, Placa } = req.body
        const filter = { Placa: placa || Placa }
        const update = { 'Situação': 'Reativado' }
        //@ts-ignore
        oldVehiclesModel.findOneAndUpdate(filter, update, (err, doc) => {
            if (err) next(err)
            res.send('Veículo reativado.')
        })
    }

    baixaVeiculo = async (req, res, next) => {
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
                if (err) next(err)
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
                return res.send(false)
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
