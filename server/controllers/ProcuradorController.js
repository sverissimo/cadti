//@ts-check
const userSockets = require("../auth/userSockets");
const { Controller } = require("./Controller");
const ProcuradorRepository = require("../domain/ProcuradorRepository");
const { EntityDaoImpl } = require("../infrastructure/EntityDaoImpl");
const { ProcuradorDaoImpl } = require("../infrastructure/ProcuradorDaoImpl");
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
            let { condition } = res.locals
            const procuradores = await new ProcuradorRepository().list({ empresas, role, condition });
            res.send(procuradores)

        } catch (e) {
            console.log(e.name + ': ' + e.message)
            next(e)
        }
    }

    /** 
     * Recebe um array de procuradores no request.body e retorna uma array de IDs
     * @override  
     * @returns {Promise<(number[]| undefined)>}
     * */
    saveMany = async (req, res, next) => {

        const entityDaoImpl = new EntityDaoImpl(this.table, this.primaryKey)
        const { procuradores, empresas } = req.body

        procuradores.forEach(p => p.empresas = JSON.stringify(empresas).replace('[', '{').replace(']', '}'))

        let ids
        try {
            ids = await entityDaoImpl.saveMany(procuradores)
            return res.send(ids)
        } catch (error) {
            next(error)
        }

        let condition
        //@ts-ignore
        ids.forEach(id => condition = `${this.primaryKey} = '${id}' OR `)
        condition = 'WHERE ' + condition
        condition = condition.slice(0, condition.length - 3)
        //@ts-ignore
        await userSockets({ req, res, table: this.table, condition, event: this.event || 'insertElements', noResponse: true })

    }

    updateMany = async (req, res, next) => {
        const { procuradores, codigoEmpresa, updateUserPermission } = req.body
        if (!procuradores || !procuradores.length) {
            return res.status(400).send('Nothing to update...')
        }
        procuradores.forEach(p => p.empresas = JSON.stringify(p.empresas).replace('[', '{').replace(']', '}'))

        try {
            const result = await new ProcuradorDaoImpl().updateMany(procuradores)

            if (Array.isArray(result) && result.every(r => r.rowCount === 0) || result.rowCount === 0) {
                return res.status(404).send('Resource not found.')
            }

            if (updateUserPermission === true)
                insertEmpresa({ representantes: procuradores, codigoEmpresa })

            const io = req.app.get('io')
            const ids = procuradores.map(p => p.procurador_id)
            await this.emitSocket({ io, ids, event: 'updateProcuradores' })

            return res.send('Resources updated.')
        } catch (error) {
            next(error)
        }
    }

    /*     parseProcuradoresUpdate = async (req, res, next) => {
            const { procuradores } = req.body
    
            procuradores.forEach(p => p.empresas = JSON.stringify(p.empresas).replace('[', '{').replace(']', '}'))
            req.body.procuradores = procuradores
            next()
        } */
}

module.exports = ProcuradorController;