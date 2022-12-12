//@ts-check
const { pool } = require("../config/pgConfig")
const { getUpdatedData } = require("../getUpdatedData")
const PostgresDao = require("./PostgresDao")

class SocioDaoImpl extends PostgresDao {
    table = 'socios'
    primaryKey = 'socio_id'

    /**
     * @param {string[]} cpfs
     * @returns {Promise<object[]>} socios
     */
    checkSocios = async cpfs => {
        try {
            //Checa se o(s) cpf(s) informado(s) também é sócio de alguma outra empresa do sistema
            const cpfArray = cpfs.map(cpf => `'${cpf}'`)
            const condition = `WHERE cpf_socio IN (${cpfArray})`
            const socios = await getUpdatedData('socios', condition)

            //Parse da coluna empresas de string para JSON
            socios.forEach(s => {
                if (s.empresas)
                    s.empresas = JSON.parse(s.empresas)
            })
            return (socios)
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * @param {object[]} socios
     * @returns {Promise<string>}
     */
    updateSocios = async socios => {
        const keys = await super.getEntityPropsNames()
        let queryString = ''
        let socioIds = []

        socios.forEach(socio => {
            socioIds.push(socio.socio_id)
            //@ts-ignore
            keys.forEach(key => {
                if (key !== 'socio_id'
                    && key !== 'cpf_socio'
                    && (socio[key] || socio[key] === '')) {

                    const value = socio[key]
                    queryString += `
                        UPDATE socios
                        SET ${key} = '${value}'
                        WHERE socio_id = ${socio.socio_id};
                        `
                }
            })
        })

        try {
            pool.query(queryString, async (err, t) => {
                if (err) throw new Error(err.message)
            });
            return 'Socios updated.'
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = { SocioDaoImpl }
