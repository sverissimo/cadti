//@ts-check
const PostgresDao = require("./PostgresDao")

class ProcuradorDaoImpl extends PostgresDao {

    constructor() {
        super()
        this.table = 'procuradores'
        this.primaryKey = 'procurador_id'
    }

    /**
     * @param {object} param0
     * @returns
     */
    saveManyProcuradores = async ({ procuradores, empresas }) => {
        const parsedEmpresas = JSON.stringify(empresas)
            .replace('[', '{')
            .replace(']', '}')
        const parsedProcuradores = procuradores.map(p => ({
            empresas: parsedEmpresas,
            ...p
        }))
        const procuradorIds = await this.saveMany(parsedProcuradores)
        return procuradorIds
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
