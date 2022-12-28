//@ts-check
const format = require("pg-format")
const PostgresDao = require("./PostgresDao")
const { getUpdatedData } = require("./SQLqueries/getUpdatedData")

class ProcuradorDaoImpl extends PostgresDao {

    constructor() {
        super()
        this.table = 'procuradores'
        this.primaryKey = 'procurador_id'
    }

    /**
    * @override
    * @param {object} empresas :number[], role: string
    * @returns {Promise<object[]>} Retorna os procuradores criados.
    */
    list = async ({ empresas, role }) => {
        let condition = ''
        let emps = ''
        if (empresas && empresas[0] && role === 'empresa') {
            condition = `WHERE procuradores.procurador_id = 0`
            empresas.forEach(e => emps += ` or ${e} = ANY(procuradores.empresas)`)
            condition += emps
        }

        const data = await getUpdatedData('procuradores', condition)
        return data
    }

    /**
    * @override
    * @param {any[]} procuradores
    * @returns {Promise<object[]>} savedProcuradores
    */
    saveMany = async (procuradores) => {
        const parseEmpresas = e => JSON.stringify(e)
            .replace('[', '{')
            .replace(']', '}')
        const parsedProcuradores = procuradores.map(p => ({
            ...p,
            empresas: parseEmpresas(p.empresas)
        }))
        const keysAndValuesArray = this.parseRequestBody(parsedProcuradores)
        const { keys, values } = keysAndValuesArray
        const query = format(`INSERT INTO ${this.table} (${keys}) VALUES %L`, values) + ` RETURNING *`
        const { rows } = await PostgresDao.pool.query(query)
        return rows
    }

    /**
    * @param {object[]} procuradores
    * @returns
    */
    updateManyProcuradores = async procuradores => {
        const parsedProcuradores = procuradores.map(procurador => {
            procurador.empresas = JSON.stringify(procurador.empresas)
                .replace('[', '{')
                .replace(']', '}')
            return procurador
        })

        const result = await this.updateMany(parsedProcuradores)
        return result
    }
}

module.exports = { ProcuradorDaoImpl }
