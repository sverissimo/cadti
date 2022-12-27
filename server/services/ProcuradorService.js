//@ts-check
const ProcuradorRepository = require("../repositories/ProcuradorRepository")
const { SocioService } = require("./SocioService")
const { UserService } = require("./UserService")

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
     * @param {any[]} procuradores
     * @param {number} codigoEmpresa
     * @returns {Promise<object[]|false>} procuradores | false
     */
    static async removeProcuracao(procuradores, codigoEmpresa) {
        const updates = procuradores.map(({ procurador_id, empresas }) => {
            const updatedEmpresas = empresas.filter(e => e !== codigoEmpresa)
            return {
                procurador_id,
                empresas: updatedEmpresas
            }
        })

        const procuradorRepository = new ProcuradorRepository()
        const result = await procuradorRepository.updateMany(updates)
        if (!result) {
            return false
        }

        const ids = updates.map(({ procurador_id }) => procurador_id)
        const updatedProcuradores = await procuradorRepository.find(ids)
        return updatedProcuradores
    }

    /**
     * @param {number} id
     * @param {number} codigoEmpresa
     * @returns {Promise<string|boolean>} Mensagem de erro ou boolean
     */
    static async deleteProcurador(id, codigoEmpresa, hasOtherProcuracao) {
        const procuradorRepository = new ProcuradorRepository()
        const procuradorToDelete = await procuradorRepository.find(id)
        if (!procuradorToDelete.length) {
            return false
        }

        const hasProcuracao = await hasOtherProcuracao({ procuradores: procuradorToDelete })
        if (hasProcuracao.length) {
            return 'Não foi possível remover pois o procurador possui procurações vigentes.'
        }

        const { cpf_procurador } = procuradorToDelete[0]
        const isSocio = await SocioService.isSocio(cpf_procurador)
        if (!isSocio.length) {
            const permissionUpdate = await UserService.removePermissions([cpf_procurador], codigoEmpresa)
            console.log("ProcuradorService.js:79 ~ deleteProcurador ~ permissionUpdate: ", permissionUpdate)
        }

        const result = await procuradorRepository.delete(id)
        return result
    }
}

module.exports = { ProcuradorService }