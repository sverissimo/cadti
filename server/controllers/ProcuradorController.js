//@ts-check
const { Controller } = require("./Controller");
const { CustomSocket } = require("../sockets/CustomSocket");
const ProcuradorRepository = require("../repositories/ProcuradorRepository");
const insertEmpresa = require("../users/insertEmpresa");

class ProcuradorController extends Controller {

    table = 'procuradores'
    primaryKey = 'procurador_id'
    webSocketEvent = 'insertProcuradores'

    constructor() {
        super('procuradores', 'procurador_id');
        this.repository = new ProcuradorRepository()
    }

    /** @override */
    list = async (req, res, next) => {
        try {
            const { empresas, role } = req.user && req.user
            const procuradores = await this.repository.list({ empresas, role });
            res.send(procuradores)
        } catch (e) {
            next(e)
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
            const socket = new CustomSocket(io, this.table)
            socket.emit('insertElements', savedProcuradores, codigoEmpresa)

            const procuradoresId = savedProcuradores.map(p => p.procurador_id)
            return res.status(201).send(procuradoresId)
        } catch (error) {
            next(error)
        }
    }

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
                insertEmpresa({ representantes: procuradores, codigoEmpresa })
            }

            const io = req.app.get('io')
            const socket = new CustomSocket(io, this.table)
            const ids = procuradores.map(p => p.procurador_id)
            const updates = await this.repository.find(ids)

            socket.emit('updateAny', updates, codigoEmpresa, this.primaryKey)

            return res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = ProcuradorController
