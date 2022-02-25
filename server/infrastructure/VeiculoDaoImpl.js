//@ts-check
const PostgresDao = require("./PostgresDao");

class VeiculoDaoImpl extends PostgresDao {
    /**
     * @property table - nome da tabela vinculada à entidade
     * @type {string}     */
    table = 'veiculos'

    /**
     * @property primaryKey - nome da coluna referente ao ID da tabela
     * @type {string}     */
    primaryKey = 'veiculo_id';

    constructor() {
        super()
    }

    /**@override */
    update = async (reqBody) => {

        const
            client = await this.pool.connect()
            , { veiculo_id, ...requestObject } = reqBody
            , condition = ` WHERE ${this.table}.${this.primaryKey} = ${reqBody[this.primaryKey]}`

        let query = ''

        if (Object.keys(requestObject).length < 1)
            return 'Nothing to update...'


        Object.entries(requestObject).forEach(([k, v]) => {
            if (k === 'equipamentos_id' || k === 'acessibilidade_id') v = `[${v}]`
            if (k === 'compartilhado_id' && v === 'NULL') query += `${k} = NULL, `
            else query += `${k} = '${v}', `
        })

        query = `UPDATE ${this.table} SET ` +
            query.slice(0, query.length - 2)

        query = query + condition + ` RETURNING veiculos.veiculo_id`
        console.log("🚀 ~ file: VeiculoRepository.js ~ line 79 ~ VeiculoRepository ~ update ~ query", { query })

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
            client.release()
        }
    }

}

module.exports = VeiculoDaoImpl