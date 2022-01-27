//@ts-check
const
    VeiculoDaoImpl = require("../infrastructure/VeiculoDaoImpl")
    , { pool } = require("../config/pgConfig")

/**
 * Classe que corresponde ao repositório de veículos. Herda os métodos get e pool (pgConfig) da classe parent EntityRepository
 */
class VeiculoRepository {
    /* 
        /** Lista as entradas de uma determinada tabela
         * @param table {string} 
         * @param condition {string}
         * @returns {Promise<void | any>}         
        */

    async findOne(id) {
        try {
            const data = await new VeiculoDaoImpl().findOne(id)
            return data

        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }

    }

    async list() {
        try {
            const data = await new VeiculoDaoImpl().list()
            return data

        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }

    /**
     * @param vehicle {Object}      
     * @returns {Promise<void | number>} Retorna o id do veículo criado / throws an error.
     */
    async create(vehicle) {

        try {
            const veiculoId = await new VeiculoDaoImpl().save(vehicle)
            return veiculoId

        } catch (error) {
            console.log("🚀 ~ file: VeiculoRepository.js ~ line 54 ~ VeiculoRepository ~ create ~ error", error.message)
            throw new Error(error.message)
        }
    }

    async update(reqBody) {
        console.log("🚀 ~ file: VeiculoRepository.js ~ line 57 ~ VeiculoRepository ~ update ~ reqBody", reqBody)
        const
            client = await pool.connect()
            , { table, tablePK, veiculoId, ...requestObject } = reqBody
            , condition = ` WHERE ${table || 'veiculos'}.${tablePK || 'veiculo_id'} = ${veiculoId}`

        let query = ''

        if (Object.keys(requestObject).length < 1)
            return 'Nothing to update...'


        Object.entries(requestObject).forEach(([k, v]) => {
            if (k === 'equipamentos_id' || k === 'acessibilidade_id') v = `[${v}]`
            if (k === 'compartilhado_id' && v === 'NULL') query += `${k} = NULL, `
            else query += `${k} = '${v}', `
        })

        query = `UPDATE ${table || 'veiculos'} SET ` +
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
            console.log("🚀 ~ file: VeiculoRepository.js ~ line 67 ~ VeiculoRepository ~ create ~ CLIENT RELEASED!!!!!!!!!!!!")
            client.release()
        }
    }
}


module.exports = VeiculoRepository