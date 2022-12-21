//@ts-check
const ProcuradorRepository = require("../repositories/ProcuradorRepository")

class ProcuradorService {

    /**
     * @param {number[]} ids
     * @param {number} codigoEmpresa
     * @returns {Promise<object[]|false>} procuradores | false
     */
    static async addProcuracao(ids, codigoEmpresa) {
        if (!codigoEmpresa) {
            throw new Error("ProcuradorService: codigoEmpresa required.")
        }
        const procuradorRepository = new ProcuradorRepository()
        const procuradores = await procuradorRepository.find(ids)

        const updates = procuradores.map(({ procurador_id, empresas }) => {
            const updatedEmpresas = new Set(empresas)
            updatedEmpresas.add(codigoEmpresa)
            return {
                procurador_id,
                empresas: [...updatedEmpresas]
            }
        })

        const result = await procuradorRepository.updateMany(updates)

        if (!result) {
            return false
        }
        const updatedProcuradores = await procuradorRepository.find(ids)
        return updatedProcuradores
    }

    /**
     * @param {number[]} ids
     * @param {number} codigoEmpresa
     * @returns {Promise<object[]|false>} procuradores | false
     */
    static async removeProcuracao(ids, codigoEmpresa) {
        const procuradorRepository = new ProcuradorRepository()
        const procuradores = await procuradorRepository.find(ids)

        const updates = procuradores.map(({ procurador_id, empresas }) => {
            const updatedEmpresas = empresas.filter(e => e !== codigoEmpresa)
            return {
                procurador_id,
                empresas: updatedEmpresas
            }
        })

        const result = await procuradorRepository.updateMany(updates)

        if (!result) {
            return false
        }
        const updatedProcuradores = await procuradorRepository.find(ids)
        return updatedProcuradores
    }
}

module.exports = { ProcuradorService }