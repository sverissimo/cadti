//@ts-check
const SocioRepository = require("../repositories/SocioRepository");
const { SocioService } = require("../services/SocioService");
const { CustomSocket } = require("../sockets/CustomSocket");
const { Controller } = require("./Controller");

class SocioController extends Controller {

    constructor() {
        super('socios', 'socio_id')
        this.repository = new SocioRepository()
    }

    /** @override */
    list = async (req, res, next) => {
        if (req.params.id || Object.keys(req.query).length) {
            return this.find(req, res, next)
        }
        try {
            const { empresas, role } = req.user && req.user
            const socios = await this.repository.list({ empresas, role });
            res.send(socios)
        } catch (e) {
            next(e)
        }
    }


    /**Verifica existência de sócios */
    checkSocios = async (req, res, next) => {
        const { newCpfs } = req.body

        if (!Array.isArray(newCpfs)) {
            return res.send([])
        }
        try {
            const socios = await SocioService.checkSocios(newCpfs)
            return res.send(socios)
        } catch (error) {
            next(error)
        }
    }

    updateSocios = async (req, res, next) => {
        const { socios, codigoEmpresa, cpfsToAdd, cpfsToRemove } = req.body
        try {
            const result = await SocioService.updateSocios({
                socios,
                codigoEmpresa,
                cpfsToAdd,
                cpfsToRemove,
            })

            if (!result) {
                return res.status(404).send('No socios found with request ids.')
            }

            const ids = socios.map(s => s.socio_id)
            const updates = await this.repository.find(ids)
            const io = req.app.get('io')
            const socket = new CustomSocket(io, this.table, this.primaryKey)

            socket.emit('updateAny', updates, codigoEmpresa)
            return res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    saveMany = async (req, res, next) => {
        const { codigo_empresa, codigoEmpresa, socios } = req.body
        try {
            const ids = await SocioService.saveMany({
                socios,
                codigoEmpresa: codigoEmpresa || codigo_empresa,
            })

            const createdSocios = await this.repository.find(ids)
            const io = req.app.get('io')
            const socket = new CustomSocket(io, this.table, this.primaryKey)

            socket.emit('insertElements', createdSocios, codigoEmpresa)
            return res.status(201).send(ids)
        } catch (error) {
            next(error)
        }
    }

    /** @override */
    delete = async (req, res, next) => {
        const { user } = req
        const { id, codigoEmpresa } = req.query

        if (user.role !== 'admin') {
            return res.status(403).send('É preciso permissão de administrador para acessar essa parte do cadTI.')
        }
        if (!id) {
            return res.status(400).send('Bad request: ID or table missing.')
        }

        const result = await SocioService.deleteSocio(id, codigoEmpresa)
            .catch(err => next(err))

        if (!result) {
            return res.status(404).send('No entry found.')
        }

        const io = req.app.get('io')
        const socket = new CustomSocket(io, this.table, this.primaryKey)
        socket.delete(id, codigoEmpresa)
        return res.status(204).end()
    }
}

module.exports = { SocioController }
