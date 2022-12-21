//@ts-check
const userSockets = require("../auth/userSockets");
const { Controller } = require("./Controller");
const ProcuradorRepository = require("../repositories/ProcuradorRepository");
const insertEmpresa = require("../users/insertEmpresa");
const { CustomSocket } = require("../sockets/CustomSocket");

class ProcuradorController extends Controller {

    table = 'procuradores'
    primaryKey = 'procurador_id'
    webSocketEvent = 'insertProcuradores'

    constructor() {
        super('procuradores', 'procurador_id');
    }

    /** @override */
    list = async (req, res, next) => {
        try {
            const { empresas, role } = req.user && req.user
            const procuradores = await new ProcuradorRepository().list({ empresas, role });
            res.send(procuradores)

        } catch (e) {
            next(e)
        }
    }

    /**
     * Recebe um objeto com array de procuradores e codigoEmpresa no request.body e retorna uma array de IDs
     * @returns {Promise<(number[]| undefined)>}
     * */
    saveMany = async (req, res, next) => {
        try {
            const { procuradores, codigoEmpresa } = req.body
            const savedProcuradores = await new ProcuradorRepository().saveMany(procuradores)
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
            const result = await new ProcuradorRepository().updateMany(procuradores)
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