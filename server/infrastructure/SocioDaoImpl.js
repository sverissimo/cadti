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
}

module.exports = { SocioDaoImpl }
