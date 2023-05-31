//@ts-check
const PostgresDao = require("./PostgresDao");
const { getUpdatedData } = require("./SQLqueries/getUpdatedData");

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

        const client = await ProcuracaoDaoImpl.pool.connect()
        const { keys, values } = this.parseRequestBody(procuracao)
        const query = `INSERT INTO ${this.table} (${keys}) VALUES (${values}) RETURNING ${this.primaryKey}`

        try {
            await client.query('BEGIN')
            const queryResult = await client.query(query)
            const id = queryResult.rows[0][this.primaryKey]
            await client.query('COMMIT')
            return id

        } catch (error) {
            await client.query('ROLLBACK')
            this.handleError(error)
        }
        finally {
            client.release()
        }
    }

    static async getExpiredProcuracoes() {
        try {
            const condition = 'WHERE procuracoes.vencimento < current_date'
            const expiredItems = await getUpdatedData('procuracoes', condition)
            return expiredItems
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = { ProcuracaoDaoImpl }
