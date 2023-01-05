//@ts-check
const { request, response } = require('express')
const { Controller } = require('./Controller')
const { ProcuracaoService } = require('../services/ProcuracaoService')
const { CustomSocket } = require('../sockets/CustomSocket')
const ProcuradorRepository = require('../repositories/ProcuradorRepository')

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
    save = async (req, res, next) => {
        const procuracao = req.body
        try {
            const { procuracaoId, procuradores, codigoEmpresa } = await ProcuracaoService.save(procuracao)
            if (!procuracaoId) {
                return res.status(400).send('ProcuracaoController: Could not save procuracao.')
            }
            const savedProcuracao = [{ procuracao_id: procuracaoId, ...procuracao }]

            const io = req.app.get('io')
            const procuracaoSocket = new CustomSocket(io, this.table, this.primaryKey)
            const procuradorSocket = new CustomSocket(io, 'procuradores', 'procurador_id')

            procuradorSocket.emit('updateAny', procuradores, codigoEmpresa)
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

        const result = await ProcuracaoService.deleteProcuracao(id)
            .catch(err => next(err))

        if (!result) {
            return res.status(404).send('Not found')
        }

        const { procuradorIds, codigoEmpresa } = result
        let updatedProcuradores
        if (procuradorIds.length) {
            updatedProcuradores = await new ProcuradorRepository().find(procuradorIds)
        }

        const io = req.app.get('io')
        const procuracaoSocket = new CustomSocket(io, this.table, this.primaryKey)
        const procuradorSocket = new CustomSocket(io, 'procuradores', 'procurador_id')

        procuracaoSocket.delete(id, codigoEmpresa)
        procuradorSocket.emit('updateAny', updatedProcuradores, codigoEmpresa)
        return res.status(204).end()
    }
}

module.exports = ProcuracaoController
