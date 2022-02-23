const { Socio } = require("../domain/Socio")
const PostgresDao = require("./PostgresDao")

class EmpresaDaoImpl extends PostgresDao {

    /** Método que implementa uma transaction com as operações de cadastro da empresa e dos sócios
     * @param {object} entity 
     * @returns {Promise<any>}     */
    async saveEmpresaAndSocios({ empresa, socios }) {

        const
            client = await this.pool.connect()
            , parsedEmpresa = this.parseRequestBody(empresa)
            , empresaQuery = `INSERT INTO empresas (${parsedEmpresa.keys}) VALUES (${parsedEmpresa.values}) RETURNING empresas.codigo_empresa`
        console.log("🚀 ~ file: EmpresaDaoImpl.js ~ line 15 ~ EmpresaDaoImpl ~ saveEmpresaAndSocios ~ empresaQuery", empresaQuery);


        try {
            client.query('BEGIN')
            const
                empresaResponse = await client.query(empresaQuery)
                , { codigo_empresa } = empresaResponse.rows[0]

                , updatedSocios = new Socio().addEmpresaAndShareArray(codigo_empresa, socios)
                , parsedSocios = this.parseRequestBody(updatedSocios)

            const sociosQuery = this.pgFormat(`INSERT INTO socios (${parsedSocios.keys}) VALUES %L`, parsedSocios.values) + ` RETURNING socio_id`
                .replace('\'DEFAULT\'', 'DEFAULT')
            //    .replace(/'\'DEFAULT\'', 'DEFAULT'/g)
            console.log("🚀 ~ file: EmpresaDaoImpl.js ~ line 28 ~ EmpresaDaoImpl ~ saveEmpresaAndSocios ~ sociosQuery", sociosQuery)

            const socioResponse = await client.query(sociosQuery)
                , socio_ids = socioResponse.rows.map(row => row.socio_id)

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