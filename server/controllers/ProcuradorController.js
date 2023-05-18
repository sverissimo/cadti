//@ts-check
const { Controller } = require("./Controller");
const { CustomSocket } = require("../sockets/CustomSocket");
const ProcuradorRepository = require("../repositories/ProcuradorRepository");
const { ProcuradorService } = require("../services/ProcuradorService");
const { UserService } = require("../services/UserService");
const humps = require("humps");

class ProcuradorController extends Controller {
    table = 'procuradores'
    primaryKey = 'procurador_id'
    repository = new ProcuradorRepository()

    /** @override */
    list = async (req, res, next) => {
        if (req.params.id || Object.keys(req.query).length) {
            return this.find(req, res, next)
        }
        try {
            const { empresas, role } = req.user && req.user
            const procuradores = await this.repository.list({ empresas, role });
            res.send(procuradores)
        } catch (e) {
            next(e)
        }
    }

    /**
     * Recebe o cpf do procurador como req.params
     * @returns {Promise<(object| undefined)>} procurador
     */
    findByCpf = async (req, res, next) => {
        try {
            const { cpfProcurador } = req.params
            console.log("🚀 ~ file: ProcuradorController.js:35 ~ ProcuradorController ~ findByCpf= ~ cpfProcurador:", cpfProcurador)
            const result = await this.repository.find({ cpf_procurador: cpfProcurador })
            if (!result.length) {
                return res.status(204).end()
            }

            const { created_at, ...procurador } = result[0]
            return res.send(humps.camelizeKeys(procurador))
        } catch (error) {
            next(error)
        }
    }

    /**
     * Recebe um objeto com array de procuradores e codigoEmpresa no request.body
     * @returns {Promise<(number[]| undefined)>} IDs dos procuradores salvos
     */
    saveMany = async (req, res, next) => {
        try {
            const { procuradores, codigoEmpresa } = req.body
            const savedProcuradores = await this.repository.saveMany(procuradores)
            const io = req.app.get('io')
            const socket = new CustomSocket(io, this.table, this.primaryKey)
            socket.emit('insertElements', savedProcuradores, codigoEmpresa)

            const procuradoresId = savedProcuradores.map(p => p.procurador_id)
            return res.status(201).send(procuradoresId)
        } catch (error) {
            next(error)
        }
    }

    /**@deprecated */
    updateMany = async (req, res, next) => {
        const { procuradores, codigoEmpresa, updateUserPermission } = req.body
        if (!procuradores || !procuradores.length) {
            return res.status(400).send('Nothing to update...')
        }
        try {
            const result = await this.repository.updateMany(procuradores)
            if (!result) {
                return res.status(404).send('Resource not found.')
            }

            if (updateUserPermission === true) {
                await UserService.addPermissions(procuradores, codigoEmpresa)
            }

            const io = req.app.get('io')
            const socket = new CustomSocket(io, this.table, this.primaryKey)
            const ids = procuradores.map(p => p.procurador_id)
            const updates = await this.repository.find(ids)

            socket.emit('updateAny', updates, codigoEmpresa)

            return res.status(204).end()
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

        const result = await ProcuradorService.deleteProcurador(id, codigoEmpresa)
            .catch(err => next(err))

        if (!result) {
            return res.status(404).send('Not found')
        }
        if (typeof result === 'string') {
            return res.status(409).send(result)
        }

        const io = req.app.get('io')
        const socket = new CustomSocket(io, this.table, this.primaryKey)
        socket.delete(id, codigoEmpresa)
        res.status(204).end()
    }
}

module.exports = ProcuradorController
