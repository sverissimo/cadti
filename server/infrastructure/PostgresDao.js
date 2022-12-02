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
        let value
        let condition = `WHERE ${this.table}.${this.primaryKey} = $1`

        if (Array.isArray(filter)) {
            condition = `WHERE ${this.table}.${this.primaryKey} IN (${filter.join()})`
            value = ''
        }
        else if (typeof filter === 'object') {
            [[key, value]] = Object.entries(filter)

            condition = `WHERE ${this.table}.${key} = '${value}'`
            value = undefined
        }
        else
            value = [filter]

        const
            queryGenerator = allGetQueries[this.table]
            , query = queryGenerator(condition)

        //@ts-ignore
        const response = await pool.query(query, value)
            //  , response = await pool.query(query, value)
            , data = response.rows
        console.log("🚀 ~ file: PostgresDao.js ~ line 84 ~ PostgresDao ~ find ~ data", data)

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

    /**@param {object | Array<object>} requestBody */
    update = async (requestBody) => {

        const
            client = await pool.connect()
            , query = this.createUpdateQuery(requestBody)

        try {
            await client.query('BEGIN')
            await client.query(query)
            await client.query('COMMIT')

            return true

        } catch (error) {
            await client.query('ROLLBACK')
            console.log("🚀 ~ file: PostgresDao.js ~ line 135 ~ PostgresDao ~ update ~ ROLLBACK ~ error", error)
            throw new Error(error.message)

        } finally {
            client.release()
        }
    }

    createUpdateQuery = (requestBody, table = this.table, primaryKey = this.primaryKey) => {

        const
            isObject = requestBody && !Array.isArray(requestBody) && typeof requestBody === 'object'
            , isArray = Array.isArray(requestBody)

        let query = ''
        console.log("🚀 ~ file: PostgresDao.js ~ line 151 ~ PostgresDao ~ this.primaryKey", primaryKey)

        if (!isObject && !isArray)
            throw new Error('Invalid update object format! Expected object or array')
        if (isObject)
            query = createQuery(requestBody, table, primaryKey)

        if (isArray)
            for (let obj of requestBody) {
                query += createQuery(obj, table, primaryKey)
            }

        return query

        function createQuery(obj, table, primaryKey) {
            const
                { id: objID, [primaryKey]: uniquePK, ...update } = obj
                , id = objID || uniquePK

            let sqlQuery = `UPDATE ${table} SET `

            Object.keys(update).forEach(key => {
                sqlQuery += `
                ${key} = '${obj[key]}', `
            })

            sqlQuery = sqlQuery.slice(0, sqlQuery.length - 2)

            sqlQuery += `
                WHERE ${primaryKey} = ${id};
            `
            return sqlQuery
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
        console.log("🚀 ~ file: PostgresDao.js ~ line 196 ~ PostgresDao ~ saveMany ~ this.primaryKey", this.primaryKey)
        console.log("🚀 ~ file: PostgresDao.js ~ line 157 ~ PostgresDao ~ saveMany ~ query", query)


        const { rows } = await this.pool.query(query)
            , ids = rows.map((row) => row[this.primaryKey])

        console.log("🚀 ~ file: PostgresDao.js:201 ~ PostgresDao ~ saveMany ~ rows", ids)
        return ids
    }

    /**Retorna o nome das colunas do banco de dados Postgresql     
     * @param {string | any} table 
     */
    async getEntityPropsNames(table = this.table) {

        const query = `
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = '${table}'`
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