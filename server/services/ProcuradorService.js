//@ts-check
const ProcuradorRepository = require("../repositories/ProcuradorRepository")
const { UserService } = require("./UserService")
const { isSocio, hasAnyProcuracao, hasOtherProcuracao } = require("./utilServices")

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
     * @param {object[]} procuradores
     * @param {number} codigoEmpresa
     * @returns {Promise<boolean>} result
     */
    static async removeEmpresa(procuradores, codigoEmpresa) {
        const cpfsInOtherProcuracoes = await hasOtherProcuracao({
            cpfs: procuradores.map(p => p.cpf_procurador),
            codigoEmpresa
        })
        const procuradoresToRemove = procuradores.filter(({ cpf_procurador }) => (
            !cpfsInOtherProcuracoes.includes(cpf_procurador))
        )
        const updates = procuradoresToRemove.map(({ procurador_id, empresas }) => {
            const updatedEmpresas = empresas.filter(e => e !== codigoEmpresa)
            return {
                procurador_id,
                empresas: updatedEmpresas
            }
        })

        const procuradorRepository = new ProcuradorRepository()
        const result = await procuradorRepository.updateMany(updates)
        return result
    }

    /**
     * @param {number} id
     * @param {number} codigoEmpresa
     * @returns {Promise<string|boolean>} Mensagem de erro ou boolean
     */
    static async deleteProcurador(id, codigoEmpresa) {
        const procuradorRepository = new ProcuradorRepository()
        const procuradorToDelete = await procuradorRepository.find(id)
        if (!procuradorToDelete.length) {
            return false
        }

        const hasProcuracao = await hasAnyProcuracao(procuradorToDelete[0])
        if (hasProcuracao) {
            return 'Não foi possível remover pois o procurador possui procurações vigentes.'
        }

        const { cpf_procurador } = procuradorToDelete[0]
        const isAlsoSocio = await isSocio(cpf_procurador)
        if (!isAlsoSocio.length) {
            const permissionUpdate = await UserService.removePermissions({
                cpfProcuradores: [cpf_procurador],
                codigoEmpresa
            })
            console.log("ProcuradorService.js:79 ~ deleteProcurador ~ permissionUpdate: ", permissionUpdate)
        }

        const result = await procuradorRepository.delete(id)
        return result
    }
}

module.exports = { ProcuradorService }