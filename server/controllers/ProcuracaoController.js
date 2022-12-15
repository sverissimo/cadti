//@ts-check
const { request, response } = require('express')
const userSockets = require('../auth/userSockets')
const { Controller } = require('./Controller')
const { Repository } = require('../repositories/Repository')

class ProcuracaoController extends Controller {

    /**
    * @property table - nome da tabela vinculada à entidade
    * @type {string}     */
    table = 'procuracoes'

    /**
     * @property primaryKey - nome da coluna referente ao ID da tabela
     * @type {string}     */
    primaryKey = 'procuracao_id'

    constructor() {
        super()
        this.repository = new Repository(this.table, this.primaryKey)
    }

    /**
     * @override
     * @param {request} req
     * @param {response} res
     * @returns {Promise<void | res>}
     */
    async save(req, res) {
        const procuracao = req.body
        procuracao.procuradores = JSON.stringify(procuracao.procuradores)

        try {
            const procuracaoRepository = new Repository('procuracoes', 'procuracao_id')
            const procuracaoId = await procuracaoRepository.save(procuracao)
            const condition = `WHERE procuracoes.procuracao_id = ${procuracaoId}`

            //@ts-ignore
            //Atualiza os dados no frontEnd por meio de webSockets
            userSockets({
                req,
                table: 'procuracoes',
                event: 'insertElements',
                condition,
                noResponse: true
            })

            res.status(201).send(JSON.stringify(procuracaoId))
        } catch (error) {
            res.status(500).send(error)
        }
    }
}

module.exports = ProcuracaoController
