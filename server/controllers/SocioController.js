//@ts-check
const userSockets = require("../auth/userSockets");
const { SocioService } = require("../services/SocioService");
const { CustomSocket } = require("../sockets/CustomSocket");
const { Controller } = require("./Controller");

class SocioController extends Controller {

    table = 'socios'
    primaryKey = 'socio_id'
    event = 'insertSocios'

    constructor() {
        super('socios', 'socio_id')
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

            if (!result) {
                return res.status(404).send('No socios found with request ids.')
            }

            const ids = socios.map(s => s.socio_id)
            const updates = await this.repository.find(ids)
            const socket = new CustomSocket(req)

            socket.emit('updateAny', updates, this.table, this.primaryKey, codigoEmpresa)
            return res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    async saveMany(req, res, next) {
        const { codigo_empresa, codigoEmpresa, socios } = req.body
        try {
            const ids = await SocioService.saveMany({
                socios,
                codigoEmpresa: codigoEmpresa || codigo_empresa,
            })

            const createdSocios = await this.repository.find(ids)
            const socket = new CustomSocket(req)

            socket.emit('insertElements', createdSocios, this.table, this.primaryKey, codigoEmpresa)
            return res.status(201).send(ids)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = { SocioController }
