//@ts-check
const { getUpdatedData } = require("../getUpdatedData")
const { ProcuradorDaoImpl } = require("../infrastructure/ProcuradorDaoImpl")
const { Repository } = require("./Repository")

class ProcuradorRepository extends Repository {

    constructor() {
        super()
        this.entityManager = new ProcuradorDaoImpl()
    }

    async list({ empresas, role }) {
        try {
            let condition = ''
            let emps = ''
            if (empresas && empresas[0] && role === 'empresa') {
                condition = `WHERE procuradores.procurador_id = 0`
                empresas.forEach(e => emps += ` or ${e} = ANY(procuradores.empresas)`)
                condition += emps
            }

            const data = await getUpdatedData('procuradores', condition)
            return data
        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }

    /**
     * @param {any[]} procuradores
     * @returns {Promise<object[]>} Retorna os procuradores criados.
     */
    async saveMany(procuradores) {
        try {
            const savedProcuradores = await new ProcuradorDaoImpl().saveManyProcuradores(procuradores)
            return savedProcuradores
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * @param {object[]} procuradores
     * @returns
     */
    async updateMany(procuradores) {
        try {
            const result = await new ProcuradorDaoImpl().updateManyProcuradores(procuradores)
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = ProcuradorRepository