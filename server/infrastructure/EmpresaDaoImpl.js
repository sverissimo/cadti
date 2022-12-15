//@ts-check
const { pool } = require("../config/pgConfig")
const { SocioService } = require("../services/SocioService")
const PostgresDao = require("./PostgresDao")

class EmpresaDaoImpl extends PostgresDao {

    /** Método que implementa uma transaction com as operações de cadastro da empresa e dos sócios
     * @param {object} entity
     * @returns {Promise<any>}     */
    async saveEmpresaAndSocios({ empresa, socios }) {

        const client = await pool.connect()
        const parsedEmpresa = this.parseRequestBody(empresa)
        const empresaQuery = `INSERT INTO empresas (${parsedEmpresa.keys}) VALUES (${parsedEmpresa.values}) RETURNING empresas.codigo_empresa`

        try {
            client.query('BEGIN')
            const empresaResponse = await client.query(empresaQuery)
            const { codigo_empresa } = empresaResponse.rows[0]
            const updatedSocios = SocioService.addEmpresaAndShareArray(codigo_empresa, socios)
            const parsedSocios = this.parseRequestBody(updatedSocios)

            const sociosQuery = this.pgFormat(`INSERT INTO socios (${parsedSocios.keys}) VALUES %L`, parsedSocios.values) + ` RETURNING socio_id`
                .replace('\'DEFAULT\'', 'DEFAULT')
            //    .replace(/'\'DEFAULT\'', 'DEFAULT'/g)

            const socioResponse = await client.query(sociosQuery)
            const socio_ids = socioResponse.rows.map(row => row.socio_id)

            await client.query('COMMIT')
            return { codigo_empresa, socio_ids }

        } catch (error) {
            client.query('ROLLBACK')
            this.handleError(error)
        }
        finally {
            client.release()
        }
    }
}

module.exports = { EmpresaDaoImpl }