//@ts-check
const ProcuradorRepository = require("../repositories/ProcuradorRepository");
const { Repository } = require("../repositories/Repository");
const { ProcuradorService } = require("./ProcuradorService");
const { UserService } = require("./UserService");

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
     * @returns {Promise<object|false>} {updatedProcuradores, codigoEmpresa} | false
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

            const procuradores = await new ProcuradorRepository().find(procuradorIds)
            if (procuradores && procuradores.length > 0) {
                const cpfsInOtherProcuracoes = ProcuracaoService._hasOtherProcuracao(procuradores, procuracoes, codigoEmpresa)
                const cpfSocios = await ProcuracaoService._isSocio(procuradores)
                const cpfsToKeep = [...cpfsInOtherProcuracoes, ...cpfSocios]

                const procuradoresToRemove = procuradores.filter(({ cpf_procurador }) => !cpfsToKeep.includes(cpf_procurador))
                const cpfsToRemove = procuradoresToRemove.map(({ cpf_procurador }) => cpf_procurador)

                await ProcuradorService.removeProcuracao(procuradoresToRemove, codigoEmpresa)
                await UserService.removePermissions(cpfsToRemove, codigoEmpresa)
            }

            const result = await procuracaoRepository.delete(id)
            if (!result) {
                return false
            }

            return { procuradores, codigoEmpresa: codigoEmpresa }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * @param {any[]} procuradores
     * @param {any[]} procuracoes
     * @param {number} codigoEmpresa
     * @return {string[]} cpfsToKeep
     */
    static _hasOtherProcuracao(procuradores, procuracoes, codigoEmpresa) {
        const cpfsToKeep = []
        procuradores.forEach(({ procurador_id, cpf_procurador }) => {
            const procuracoesWithThisProcurador = procuracoes
                .filter(p => p.procuradores.includes(procurador_id)
                    && p.codigo_empresa === codigoEmpresa
                )
            const hasOtherProcuracoes = procuracoesWithThisProcurador.length >= 2
            if (hasOtherProcuracoes) {
                cpfsToKeep.push(cpf_procurador)
            }
        })
        return cpfsToKeep
    }

    /**
     * @param {any[]} procuradores
     * @return {Promise<string[]>} cpfsToKeep
     */
    static async _isSocio(procuradores) {
        const cpfProcuradores = procuradores.map(p => p.cpf_procurador)
        const socios = await new Repository('socios', 'cpf_socio').find(cpfProcuradores)
        const cpfSocios = socios.map(s => s.cpf_socio)
        return cpfSocios
    }
}

module.exports = { ProcuracaoService }
