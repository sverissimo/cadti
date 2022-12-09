//@ts-check
const PostgresDao = require("./PostgresDao");
const { pool } = require("../config/pgConfig");

class VeiculoDaoImpl extends PostgresDao {

    constructor() {
        super()
        this.table = 'veiculos'
        this.primaryKey = 'veiculo_id'
    }

    /**@override */
    update = async (reqBody) => {
        const { veiculo_id, ...requestObject } = reqBody

        if (!veiculo_id) {
            throw new Error('Must have a veiculo_id param to perform update in this implementation - VeiculoDaoImpl.js')
        }

        const client = await pool.connect()
        const condition = ` WHERE veiculos.veiculo_id = ${veiculo_id}`
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

        try {
            await client.query('BEGIN')
            const res = await client.query(query)
            const veiculoId = res.rows[0].veiculo_id

            await client.query('COMMIT')
            return veiculoId
        } catch (error) {
            await client.query('ROLLBACK')
            throw new Error(error.message)

        } finally {
            client.release()
        }
    }

    /**
     * Busca por todos os veículos utilizados por uma empresa, seja próprio ou em compartilhado.
     * @param {number} codigoEmpresa
     * @param {any[]} seguros
     */
    static getAllVehicles = async (codigoEmpresa, seguros) => {
        try {
            let vehicleIds = []
            seguros.forEach(s => {
                if (s.veiculos && s.veiculos[0])
                    vehicleIds.push(...s.veiculos)
            })

            if (!vehicleIds.length) {
                //@ts-ignore
                vehicleIds = 0
            }

            const vQuery = `
            SELECT veiculos.veiculo_id, veiculos.placa, veiculos.codigo_empresa, e.razao_social as empresa, e2.razao_social as compartilhado
            FROM veiculos
            LEFT JOIN empresas e
                ON veiculos.codigo_empresa = e.codigo_empresa
            LEFT JOIN empresas e2
                ON veiculos.compartilhado_id = e2.codigo_empresa
            WHERE veiculos.codigo_empresa = ${codigoEmpresa}
                OR veiculos.compartilhado_id = ${codigoEmpresa}
                OR veiculos.veiculo_id IN (${vehicleIds})
                    `

            const result = await pool.query(vQuery)
            const veiculos = result.rows
            return veiculos
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = VeiculoDaoImpl
