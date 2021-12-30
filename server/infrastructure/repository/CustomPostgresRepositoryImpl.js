//@ts-check

const { pool } = require("../../config/pgConfig");
const { parseRequestBody } = require("../../parseRequest");

class CustomPostgresRepositoryImpl {
    /**
     * @property pool - conexão com o postgreSql, em config/pgPool
     */
    pool = pool;

    /**
     * @property table - nome da tabela vinculada à entidade
     * @type {string}
     */
    table;

    /**
     * @property primaryKey - nome da coluna referente ao ID da tabela
     * @type {string}
     */
    primaryKey;

    parseRequestBody = parseRequestBody;

    /**      
     * @param {object} entity 
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
            console.log("🚀 ~ file: CustomPostgresRepositoryImpl.js ~ line 19 ~ CustomPostgresRepositoryImpl ~ save ~ error", { error })
            throw new Error(error)
        }
        finally {
            client.release()
        }


    }

}

module.exports = CustomPostgresRepositoryImpl