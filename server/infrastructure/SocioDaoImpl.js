//@ts-check
const { getUpdatedData } = require("./SQLqueries/getUpdatedData")
const PostgresDao = require("./PostgresDao")

class SocioDaoImpl extends PostgresDao {
    table = 'socios'
    primaryKey = 'socio_id'

    /**
    * @override
    * @param {object} empresas :object, role: string
    * @returns {Promise<object[]>} Retorna os socios criados.
    */
    list = async ({ empresas, role }) => {
        let condition = ''
        let emps = ''
        if (empresas && empresas[0] && role === 'empresa') {
            condition = 'WHERE '
            empresas.forEach(e => emps += ` socios.empresas LIKE '%${e}%' or `)
            condition += emps.slice(0, emps.length - 3)
        }

        const data = await getUpdatedData('socios', condition)
        const socios = data && data.map(s => ({ ...s, empresas: JSON.parse(s.empresas) }))
        return socios
    }

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
