//@ts-check
const ProcuradorRepository = require("../repositories/ProcuradorRepository");
const { Repository } = require("../repositories/Repository");
const { ProcuradorService } = require("./ProcuradorService");
const { UserService } = require("./UserService");
const { isSocio, hasOtherProcuracao } = require("./utilServices");


class ProcuracaoService {

    static async save(procuracao) {
        const procuradoresIds = procuracao.procuradores
        const procuracaoId = await new Repository('procuracoes', 'procuracao_id').save(procuracao)

        const { codigo_empresa: codigoEmpresa } = procuracao
        const procuradores = await ProcuradorService.addProcuracao(procuradoresIds, codigoEmpresa)
        if (!procuradores) {
            return {}
        }
        await UserService.addPermissions(procuradores, codigoEmpresa)
        return { procuracaoId, procuradores, codigoEmpresa }
    }

    /**
     * @param {number} id
     * @returns {Promise<object|false>} object {updatedProcuradores, codigoEmpresa} | false
     */
    static async deleteProcuracao(id) {
        const procuracaoRepository = new Repository('procuracoes', 'procuracao_id')
        try {
            const procuracoes = await procuracaoRepository.list()
            const procuracao = procuracoes.find(p => p.procuracao_id === id)
            if (!procuracao) {
                return false
            }

            const { codigo_empresa: codigoEmpresa, procuradores: procuradorIds } = procuracao
            const procuradorRepository = new ProcuradorRepository()
            const procuradores = await procuradorRepository.find(procuradorIds)

            if (procuradores && procuradores.length > 0) {
                const cpfsInOtherProcuracoes = await hasOtherProcuracao({
                    procuradores,
                    procuracoes,
                    codigoEmpresa
                })

                const cpfProcuradores = procuradores.map(p => p.cpf_procurador)
                const cpfSocios = await isSocio(cpfProcuradores)
                const cpfsToKeep = [...cpfsInOtherProcuracoes, ...cpfSocios]

                const cpfsToRemoveProcuracao = cpfProcuradores.filter(cpf_procurador => !cpfsInOtherProcuracoes.includes(cpf_procurador))
                const cpfsToRemovePermissions = cpfProcuradores.filter(cpf => !cpfsToKeep.includes(cpf))

                await ProcuradorService.removeProcuracao(cpfsToRemoveProcuracao, codigoEmpresa)
                await UserService.removePermissions(cpfsToRemovePermissions, codigoEmpresa)
            }

            const result = await procuracaoRepository.delete(id)
            if (!result) {
                return false
            }
            const updatedProcuradores = await procuradorRepository.find(procuradorIds)
            return { codigoEmpresa, procuradores: updatedProcuradores }
        } catch (error) {
            throw new Error(error.message)
        }
    }

}

module.exports = { ProcuracaoService }
