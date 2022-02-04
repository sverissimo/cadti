//@ts-check
const allGetQueries = require("../allGetQueries");
const { pool } = require("../config/pgConfig");
const { parseRequestBody } = require("../parseRequest");

/**Implementação do DAO no banco de dados postgresql na porta 5432 (config/pgPool)
 * @abstract @class
 */
class PostgresDao {
    /*** @property pool - conexão com o postgreSql, em config/pgPool     */
    pool = pool;

    /**
    * @property table - nome da tabela vinculada à entidade
    * @type {string}     */
    table;

    /**
    * @property primaryKey - nome da coluna referente ao ID da tabela
    * @type {string}     */
    primaryKey;

    /**
    * @property parseRequestBody - função para formatar objeto em arrays de columns/values para o query do SQL     */
    parseRequestBody = parseRequestBody;


    /** Lista as entradas de uma determinada tabela. A classe child já terá as props default(this.table)
     * Caso o objeto seja instanciado dessa classe, o método get pode ser informado como parâmetro
     * @param table {string}      
     * @returns {Promise<void | any>}
     */
    async list(table = this.table) {
        try {

            const
                queryGenerator = allGetQueries[table]
                , query = queryGenerator()
                , response = await pool.query(query)
                , data = response.rows

            return data

        } catch (e) { this.handleError(e) }
    }


    /**Busca um ou mais registros com base no parâmetro informado em req.params ou req.query
    * @param {string | object} filter - Id ou filtro (objeto key/value para servir de param para a busca)
    * @returns {Promise<any[]>} 
    */
    async find(filter) {
        let key, value

        if (typeof filter === 'object')
            [[key, value]] = Object.entries(filter)
        else
            value = filter

        let condition
        if (filter)
            condition = `WHERE ${this.table}.${key || this.primaryKey} = $1`

        const
            queryGenerator = allGetQueries[this.table]
            , query = queryGenerator(condition)
            , response = await pool.query(query, [value])
            , data = response.rows

        return data
    }


    /**      
     * @param {object} entity 
     * @returns {Promise<number>} id (promise)     */
    async save(entity) {

        const
            client = await this.pool.connect()
            , { keys, values } = this.parseRequestBody(entity)
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

    /**@param {object} requestBody */
    async update(requestBody) {
        const
            client = await pool.connect()
            , { id, ...update } = requestBody
            , condition = ` WHERE ${this.table}.${this.primaryKey} = '${requestBody[this.primaryKey]}'`

        let query = ''

        if (Object.keys(update).length < 1)
            return 'Nothing to update...'


        Object.entries(update).forEach(([key, value]) => {
            query += `${key} = '${value}', `
        })

        query = `UPDATE ${this.table} SET ` +
            query.slice(0, query.length - 2)

        query = query + condition + ` RETURNING ${this.table}.${this.primaryKey}`

        try {
            await client.query('BEGIN')
            const res = await client.query(query)

            this.id = res.rows[0][this.primaryKey]

            await client.query('COMMIT')

            return this.id

        } catch (error) {

            await client.query('ROLLBACK')
            console.log("🚀 ~ file: PostgresDao.js ~ line 135 ~ PostgresDao ~ update ~ error", error)
            throw new Error(error.message)

        } finally {
            client.release()
        }
    }


    /**@param {Error} error - Javascript Error class*/
    handleError(error) {
        console.error({ module: 'PostgresDao.js', error: error.name, errorMessage: error.message })
        throw new Error(error.message)
    }
}


module.exports = PostgresDao