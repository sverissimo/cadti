//@ts-check
const
    { pool } = require("../config/pgConfig")
    , format = require('pg-format')
    , allGetQueries = require("../allGetQueries")
    , { parseRequestBody } = require("../utils/parseRequest");


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

    pgFormat = format

    /** Lista as entradas de uma determinada tabela. A classe child já terá as props default(this.table)
     * Caso o objeto seja instanciado dessa classe, o método get pode ser informado como parâmetro     
     * @param {String} userFilter - Filtro de permissões de usuários, conforme user logado no sistema, 
     * @returns {Promise<void | any>}
     */
    list = async (userFilter) => {

        try {
            const
                queryGenerator = allGetQueries[this.table]
                , query = queryGenerator(userFilter)

            const response = await pool.query(query)
                , data = response.rows

            return data

        } catch (e) { this.handleError(e) }
    }


    /**Busca um ou mais registros com base no parâmetro informado em req.params ou req.query
    * @param {string | object | Array<string | number>} filter - Id ou filtro (objeto key/value para servir de param para a busca ou array de ids)
    * @returns {Promise<any[]>} 
    */
    async find(filter) {
        let key
            , value
            , condition = `WHERE ${this.table}.${key || this.primaryKey} = $1`

        value = [filter]

        if (Array.isArray(filter)) {
            condition = `WHERE ${this.primaryKey} IN (${filter.join()})`
            value = ''
        }
        else if (typeof filter === 'object')
            [[key, value]] = Object.entries(filter)

        const
            queryGenerator = allGetQueries[this.table]
            , query = queryGenerator(condition)
            , response = await pool.query(query, value)
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
        console.log("🚀 ~ file: PostgresDao.js ~ line 86 ~ PostgresDao ~ save ~ query", query)

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


    //@ts-ignore
    async saveMany(entities) {

        const
            keysAndValuesArray = this.parseRequestBody(entities)

        //@ts-ignore
        const
            { keys, values } = keysAndValuesArray
            , query = format(`INSERT INTO ${this.table} (${keys}) VALUES %L`, values) + ` RETURNING ${this.primaryKey}`
        console.log("🚀 ~ file: PostgresDao.js ~ line 157 ~ PostgresDao ~ saveMany ~ query", query)


        const { rows } = await this.pool.query(query)
            , ids = rows.map((row) => row[this.primaryKey])

        return ids
    }

    /**Retorna o nome das colunas do banco de dados Postgresql     
     * @param {string | any} table 
     */
    async getEntityPropsNames(table) {

        const query = `
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = '${table || this.table}'`
        console.log("🚀 ~ file: PostgresDao.js ~ line 173 ~ PostgresDao ~ getEntityPropsNames ~ query", query)

        const { rows } = await this.pool.query(query)
        console.log("🚀 ~ file: PostgresDao.js ~ line 179 ~ PostgresDao ~ getEntityPropsNames ~ rows", rows)

        if (rows.length) {

            let propNames = rows.map(r => r.column_name)

            propNames = propNames.filter(p => p !== 'id' && p !== 'created_at' && !p.match('_id'))

            return propNames
        }
    }


    /**@param {Error} error - Javascript Error class*/
    handleError(error) {
        console.error({ module: 'PostgresDao.js', error: error.name, errorMessage: error.message })
        throw new Error(error.message)
    }
}


module.exports = PostgresDao