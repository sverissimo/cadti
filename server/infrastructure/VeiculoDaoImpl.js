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

        const { veiculo_id, ...requestObject } = reqBody

        if (!veiculo_id)
            throw new Error('Must have a veiculo_id param to perform update in this implementation - VeiculoDaoImpl.js')

        const client = await this.pool.connect()
            , condition = ` WHERE veiculos.veiculo_id = ${veiculo_id}`

        let query = ''

        Object.entries(requestObject).forEach(([k, v]) => {
            if (k === 'equipamentos_id' || k === 'acessibilidade_id')
                query += `${k} = '${JSON.stringify(v)}'::json, `

            else if (k === 'compartilhado_id' && v === 'NULL')
                query += `${k} = NULL, `

            else
                query += `${k} = '${v}', `
        })

        query = `UPDATE veiculos SET ` + query.slice(0, query.length - 2)

        query = query + condition + ` RETURNING veiculos.veiculo_id`
        console.log("🚀 ~ file: VeiculoRepository.js ~ line 49 ~ VeiculoRepository ~ update ~ query", { query })

        try {
            await client.query('BEGIN')
            const
                res = await client.query(query)
                , veiculoId = res.rows[0].veiculo_id

            await client.query('COMMIT')

            return veiculoId

        } catch (error) {

            console.log("🚀 ~ file: VeiculoRepository.js ~ line 63 ~ VeiculoRepository ~ create ~ error", error.message)
            await client.query('ROLLBACK')
            throw error

        } finally {
            client.release()
        }
    }

}

module.exports = VeiculoDaoImpl