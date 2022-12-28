//@ts-check
const { ProcuradorDaoImpl } = require("../infrastructure/ProcuradorDaoImpl")
const { Repository } = require("./Repository")

class ProcuradorRepository extends Repository {
    table = 'procuradores'
    primaryKey = 'procurador_id'
    entityManager = new ProcuradorDaoImpl()

    /**
     * @override
     * @param {object} empresas :number[], role: string
     * @returns {Promise<object[]>} Retorna os procuradores criados.
     */
    list = async ({ empresas, role }) => {
        try {
            const procuradores = await this.entityManager.list({ empresas, role })
            return procuradores
        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }

    /**
     * @param {any[]} procuradores
     * @returns {Promise<object[]>} Retorna os procuradores criados.
     */
    saveMany = async (procuradores) => {
        try {
            const savedProcuradores = await this.entityManager.saveMany(procuradores)
            return savedProcuradores
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * @param {object[]} procuradores
     * @returns {Promise<boolean>}
     */
    updateMany = async (procuradores) => {
        try {
            const result = await this.entityManager.updateManyProcuradores(procuradores)
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = ProcuradorRepository