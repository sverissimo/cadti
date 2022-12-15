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
     * @param procuradoresRequestObject {Object}
     * @returns {Promise<number[]>} Retorna o id do veículo criado / throws an error.
     */
    async saveMany({ procuradores, empresas }) {
        try {
            const procuradorIds = await new ProcuradorDaoImpl().saveManyProcuradores({ procuradores, empresas })
            return procuradorIds
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