//@ts-check
const userSockets = require("../auth/userSockets");
const { SocioService } = require("../services/SocioService");
const { Controller } = require("./Controller");

class SocioController extends Controller {

    table = 'socios'
    primaryKey = 'socio_id'
    event = 'insertSocios'

    constructor() {
        super('socios', 'socio_id');
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
        const { socios, codigoEmpresa, cpfsToAdd } = req.body

        try {
            const result = await SocioService.updateSocios({
                socios,
                codigoEmpresa,
                cpfsToAdd
            })

            //@ts-ignore
            userSockets({ req, res, table: 'socios', event: 'updateSocios', noResponse: true })
            if (!result) {
                return res.status(404).send('No socios found with request ids.')
            }
            return res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    /**
     * @override
     */
    async saveMany(req, res, next) {
        const { codigo_empresa, codigoEmpresa, socios } = req.body
        try {
            const ids = await SocioService.saveMany({
                socios,
                codigoEmpresa: codigoEmpresa || codigo_empresa,
            })
            let condition

            ids.forEach(id => condition = `${this.primaryKey} = '${id}' OR `)
            condition = 'WHERE ' + condition
            condition = condition.slice(0, condition.length - 3)
            //@ts-ignore
            await userSockets({ req, res, table: this.table, condition, event: this.event || 'insertElements', noResponse: true })
            return res.status(201).send(ids)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = { SocioController }
