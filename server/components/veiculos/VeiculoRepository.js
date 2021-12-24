//@ts-check
const
    { request, response } = require("express")
    , EntityRepository = require("../EntityRepository")
    , { getUpdatedData } = require("../../getUpdatedData")



/**
 * Classe que corresponde ao repositório de veículos. Herda os métodos get e pool (pgConfig) da classe parent EntityRepository
 */
class VeiculoRepository extends EntityRepository {

    constructor() {
        super()
    }

    /**
         * Lista as entradas de uma determinada tabela
         * @param table {string} 
         * @param condition {string}
         * @returns {Promise<void | any>}         
        */
    async getVehicles(table, condition) {
        try {
            const data = await getUpdatedData(table, condition || '')
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
        const
            client = await this.pool.connect()
            , reqObj = vehicle
            , { keys, values } = this.parseRequestBody(reqObj)
            , query = `INSERT INTO public.veiculos (${keys}) VALUES (${values}) RETURNING veiculo_id`

        console.log({ query })

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

    async update(reqBody) {
        const
            client = await this.pool.connect()
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


module.exports = VeiculoRepository