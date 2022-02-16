//@ts-check
const PostgresDao = require("./PostgresDao");

class ProcuracaoDaoImpl extends PostgresDao {
    /**
     * @property table - nome da tabela vinculada à entidade
     * @type {string}     */
    table = 'procuracoes'

    /**
     * @property primaryKey - nome da coluna referente ao ID da tabela
     * @type {string}     */
    primaryKey = 'procuracao_id';

    constructor() {
        super()
    }
    /**
     * @override
     */
    async save(procuracao) {

        let parseProc = procuracao.procuradores.toString()
        parseProc = '[' + parseProc + ']'
        procuracao.procuradores = parseProc

        const
            client = await this.pool.connect()
            , { keys, values } = this.parseRequestBody(procuracao)
            , query = `INSERT INTO ${this.table} (${keys}) VALUES (${values}) RETURNING ${this.primaryKey}`

        try {
            client.query('BEGIN')
            const
                res = await client.query(query)
                , id = res.rows[0][this.primaryKey]

            await client.query('COMMIT')
            return id

        } catch (error) {
            client.query('ROLLBACK')
            this.handleError(error)
        }
        finally {
            client.release()
        }
    }
}

module.exports = { ProcuracaoDaoImpl }