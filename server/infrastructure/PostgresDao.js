//@ts-check
const allGetQueries = require("../allGetQueries");
const { pool } = require("../config/pgConfig");
const { parseRequestBody } = require("../parseRequest");

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


    async findOne(filter) {
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

        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }

    /**      
     * @param {object} entity 
     * @returns {Promise<number>} id (promise)
     */
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
            console.log("🚀 ~ file: PostgresDao.js ~ line 19 ~ PostgresDao ~ save ~ error", { error })
            throw new Error(error)
        }
        finally {
            client.release()
        }
    }

    async update(reqBody) {
        const
            client = await pool.connect()
            , { requestObject, table, tablePK, id } = reqBody
            , condition = ` WHERE ${table}.${tablePK} = '${id}'`

        let query = ''

        if (Object.keys(requestObject).length < 1)
            return 'Nothing to update...'


        Object.entries(requestObject).forEach(([k, v]) => {
            if (k === 'equipamentos_id' || k === 'acessibilidade_id') v = `[${v}]`
            if (k === 'compartilhado_id' && v === 'NULL') query += `${k} = NULL, `
            else query += `${k} = '${v}', `
        })

        query = `UPDATE ${table} SET ` +
            query.slice(0, query.length - 2)

        query = query + condition + ` RETURNING veiculos.veiculo_id`

        try {
            await client.query('BEGIN')
            const
                res = await client.query(query)
                , veiculoId = res.rows[0].veiculo_id

            await client.query('COMMIT')

            return veiculoId

        } catch (error) {

            console.log("🚀 ~ file: VeiculoRepository.js ~ line 54 ~ VeiculoRepository ~ create ~ error", error.message)
            await client.query('ROLLBACK')
            throw new Error(error.message)

        } finally {
            console.log("🚀 ~ file: VeiculoRepository.js ~ line 67 ~ VeiculoRepository ~ create ~ CLIENT RELEASED!!!!!!!!!!!!")
            client.release()
        }
    }
}


module.exports = PostgresDao