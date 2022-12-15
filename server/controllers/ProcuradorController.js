//@ts-check
const userSockets = require("../auth/userSockets");
const { Controller } = require("./Controller");
const ProcuradorRepository = require("../repositories/ProcuradorRepository");
const insertEmpresa = require("../users/insertEmpresa");

class ProcuradorController extends Controller {

    table = 'procuradores'
    primaryKey = 'procurador_id'
    webSocketEvent = 'insertProcuradores'

    constructor() {
        super('socios', 'procurador_id');
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
     * Recebe um array de procuradores no request.body e retorna uma array de IDs
     * @override
     * @returns {Promise<(number[]| undefined)>}
     * */
    saveMany = async (req, res, next) => {
        try {
            const { procuradores, empresas } = req.body
            const procuradorIds = await new ProcuradorRepository().saveMany({ procuradores, empresas })
            let condition

            procuradorIds.forEach(id => condition = `${this.primaryKey} = '${id}' OR `)
            condition = 'WHERE ' + condition
            condition = condition.slice(0, condition.length - 3)
            //@ts-ignore
            await userSockets({ req, res, table: this.table, condition, event: this.event || 'insertElements', noResponse: true })

            return res.status(201).send(procuradorIds)
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
            const ids = procuradores.map(p => p.procurador_id)
            await this.emitSocket({ io, ids, event: 'updateProcuradores' })

            return res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = ProcuradorController