//@ts-check
const
    { request, response } = require('express')
    , userSockets = require('../auth/userSockets')
    , { Controller } = require('./Controller')
    , { Repository } = require('../repositories/Repository')


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
        this.repository = new Repository()
    }

    /**
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<void | res>}
     * @override
     */
    async save(req, res) {
        let parseProc = req.body.procuradores.toString()
        parseProc = '[' + parseProc + ']'
        req.body.procuradores = parseProc

        try {
            const
                procuracaoRepository = new Repository('procuracoes', 'procuracao_id')
                , procuracaoId = await procuracaoRepository.save(req.body)
                , condition = `WHERE procuracoes.procuracao_id = ${procuracaoId}`

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
