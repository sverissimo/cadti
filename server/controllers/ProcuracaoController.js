//@ts-check
const { request, response } = require('express')
const { Controller } = require('./Controller')
const { ProcuracaoService } = require('../services/ProcuracaoService')
const { CustomSocket } = require('../sockets/CustomSocket')

class ProcuracaoController extends Controller {

    constructor() {
        super('procuracoes', 'procuracao_id')
    }

    /**
     * @override
     * @param {request} req
     * @param {response} res
     * @returns {Promise<void | res>}
     */
    async save(req, res, next) {
        const procuracao = req.body
        try {
            const { procuracaoId, procuradores, codigoEmpresa } = await ProcuracaoService.save(procuracao)
            if (!procuracaoId) {
                return res.status(400).send('ProcuracaoController: Could not save procuracao.')
            }
            const savedProcuracao = [{ procuracao_id: procuracaoId, ...procuracao }]

            const io = req.app.get('io')
            const procuradorSocket = new CustomSocket(io, 'procuradores')
            const procuracaoSocket = new CustomSocket(io, 'procuracoes')

            procuradorSocket.emit('updateAny', procuradores, codigoEmpresa, 'procurador_id')
            procuracaoSocket.emit('insertElements', savedProcuracao, codigoEmpresa)
            res.status(201).send(JSON.stringify(procuracaoId))

        } catch (error) {
            next(error)
        }
    }

    /** @override          */
    delete = async (req, res, next) => {
        const id = Number(req.query.id)
        if (!id) {
            return res.status(400).send('No id provided.')
        }

        const { procuradores, codigoEmpresa } = await ProcuracaoService.deleteProcuracao(id)
            .catch(err => next(err))

        if (!procuradores) {
            return res.status(404).send('Not found')
        }

        const io = req.app.get('io')
        const procuracaoSocket = new CustomSocket(io, this.table)
        const procuradorSocket = new CustomSocket(io, 'procuradores')

        procuracaoSocket.delete(id, 'procuracao_id', codigoEmpresa)
        procuradorSocket.emit('updateAny', procuradores, codigoEmpresa, 'procurador_id')
        res.send(`${id} deleted from ${this.table}`)
    }
}

module.exports = ProcuracaoController
