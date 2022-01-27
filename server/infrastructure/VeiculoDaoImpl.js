//@ts-check

const { pool } = require("../config/pgConfig");
const { parseRequestBody } = require("../parseRequest");
const PostgresDao = require("./PostgresDao");

class VeiculoDaoImpl extends PostgresDao {
    /**
     * @property pool - conexão com o postgreSql, em config/pgPool
     */
    pool = pool;

    /**
     * @property table - nome da tabela vinculada à entidade
     * @type {string}
     */
    table = 'veiculos'

    /**
     * @property primaryKey - nome da coluna referente ao ID da tabela
     * @type {string}
     */
    primaryKey = 'veiculo_id';

    parseRequestBody = parseRequestBody;


    /**      
     * @param {object} entity 
     * @returns {Promise<number>} id (promise)
     */
    /* async save(entity) {

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
            console.log("🚀 ~ file: VeiculoDaoImpl.js ~ line 19 ~ VeiculoDaoImpl ~ save ~ error", { error })
            throw new Error(error)
        }
        finally {
            client.release()
        }
    } */
}

module.exports = VeiculoDaoImpl