//@ts-check
const { pool } = require("../config/pgConfig")
const format = require('pg-format')
const allGetQueries = require("../allGetQueries")
const { parseRequestBody } = require("../utils/parseRequest");

/**Implementação do DAO no banco de dados postgresql na porta 5432 (config/pgPool)
 * @abstract @class
 */
class PostgresDao {
    /*** @property pool - conexão com o postgreSql, em config/pgPool     */
    static pool = pool;
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
            const queryGenerator = allGetQueries[this.table]
            const query = queryGenerator(userFilter)
            const response = await pool.query(query)
            const data = response.rows

            return data
        } catch (e) {
            throw new Error(e.message)
        }
    }

    /**Busca um ou mais registros com base no parâmetro informado em req.params ou req.query
    * @param {string | object | Array<string | number>} filter - Id ou filtro (objeto key/value para servir de param para a busca ou array de ids)
    * @returns {Promise<any[]>}
    */
    async find(filter) {
        let key
        let value
        let condition = `WHERE ${this.table}.${this.primaryKey} = $1`
        // Verifica o tipo de filtro
        if (Array.isArray(filter)) {
            condition = format(`WHERE ${this.table}.${this.primaryKey} IN (%L)`, filter)
            value = ''
        }
        else if (typeof filter === 'object') {
            [[key, value]] = Object.entries(filter)
            condition = `WHERE ${this.table}.${key} = '${value}'`
            value = undefined
            console.log("🚀 ~ file: PostgresDao.js:62 ~ PostgresDao ~ find ~ condition", condition)
        }
        else {
            value = [filter]
        }
        try {
            const queryGenerator = allGetQueries[this.table]
            const query = queryGenerator(condition)
            //@ts-ignore
            const response = await pool.query(query, value)
            const data = response.rows
            return data
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * @param {object} entity
     * @returns {Promise<number>} id (promise)     */
    async save(entity) {
        const client = await PostgresDao.pool.connect()
        const { keys, values } = this.parseRequestBody(entity)
        const query = `INSERT INTO ${this.table} (${keys}) VALUES (${values}) RETURNING ${this.primaryKey}`
        try {
            client.query('BEGIN')
            const res = await client.query(query)
            const id = res.rows[0][this.primaryKey]

            await client.query('COMMIT')
            return id

        } catch (error) {
            client.query('ROLLBACK')
            throw new Error(error.message)
        }
        finally {
            client.release()
        }
    }

    /**@param {object | Array<object>} requestBody */
    update = async (requestBody) => {
        const client = await pool.connect()
        const query = this.createUpdateQuery(requestBody)

        try {
            await client.query('BEGIN')
            const result = await client.query(query)
            await client.query('COMMIT')

            return !!result.rowCount

        } catch (error) {
            await client.query('ROLLBACK')
            throw new Error(error.message)
        } finally {
            client.release()
        }
    }

    /** @returns {Promise<boolean>} */
    updateMany = async (entityArray) => {
        try {
            let updateQuery = this.createUpdateQuery(entityArray)
            const result = await PostgresDao.pool.query(updateQuery)
            return !!result.rowCount || Array.isArray(result) && result.some(r => !!r.rowCount)
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * @param {object|Array} requestBody
     * @param {string} table
     * @param {string} primaryKey
     * @returns {string}
     */
    createUpdateQuery = (requestBody, table = this.table, primaryKey = this.primaryKey) => {

        const isObject = requestBody && !Array.isArray(requestBody) && typeof requestBody === 'object'
        const isArray = Array.isArray(requestBody)
        let query = ''

        if (!isObject && !isArray) {
            throw new Error('Invalid update object format! Expected object or array')
        }
        if (isObject) {
            query = createQuery(requestBody, table, primaryKey)
        }

        if (isArray) {
            for (let obj of requestBody) {
                query += createQuery(obj, table, primaryKey)
            }
        }

        return query

        function createQuery(obj, table, primaryKey) {
            const { id: objID, [primaryKey]: uniquePK, ...update } = obj
            const id = objID || uniquePK

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
        const keysAndValuesArray = this.parseRequestBody(entities)
        const { keys, values } = keysAndValuesArray
        const query = format(`INSERT INTO ${this.table} (${keys}) VALUES %L`, values) + ` RETURNING ${this.primaryKey}`
        const { rows } = await PostgresDao.pool.query(query)
        const ids = rows.map((row) => row[this.primaryKey])
        return ids
    }

    delete = async (id) => {
        //REFACTOR!!!
        if (this.table === 'laudos') {
            id = `'${id}'`
        }

        const query = ` DELETE FROM public.${this.table} WHERE ${this.primaryKey} = ${id}`
        const result = await pool.query(query)
        return !!result.rowCount
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

        const { rows } = await PostgresDao.pool.query(query)

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
