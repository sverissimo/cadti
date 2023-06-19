//@ts-check
const { ProcuracaoDaoImpl } = require("../infrastructure/ProcuracaoDaoImpl");
const ProcuradorRepository = require("../repositories/ProcuradorRepository");
const { Repository } = require("../repositories/Repository");
const { ProcuradorService } = require("./ProcuradorService");
const { UserService } = require("./UserService");

class ProcuracaoService {

    static async save(procuracao) {
        try {
            const { codigo_empresa: codigoEmpresa } = procuracao
            const procuradoresIds = procuracao.procuradores
            const procuracaoId = await new Repository('procuracoes', 'procuracao_id').save(procuracao)
            const procuradores = await ProcuradorService.addProcuracao(procuradoresIds, codigoEmpresa)
            if (!procuradores) {
                return {}
            }

            await UserService.addPermissions(procuradores, codigoEmpresa)
            return { procuracaoId, procuradores, codigoEmpresa }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * Apaga a procuração, com a opção de softDelete, que mantém a procuração no sistema, mas revoga as permissões de usuário/procuradores
     * O soft delete é utilizado pelo TaskManager para atualizar automaticamente procurações que estiverem vencidas.
     *      *
     * @param {number} id
     * @param {boolean} [softDelete]
     * @returns {Promise<object|false>} object {updatedProcuradores, codigoEmpresa} | false
     */
    static async deleteProcuracao(id, softDelete = false) {
        const procuracaoRepository = new Repository('procuracoes', 'procuracao_id')
        try {
            const procuracoes = await procuracaoRepository.find(id)
            if (!procuracoes.length) {
                return false
            }

            if (!softDelete) {
                const result = await procuracaoRepository.delete(id)
                if (!result) return false
            }

            const { codigo_empresa: codigoEmpresa, procuradores: procuradorIds } = procuracoes[0]
            const procuradores = await new ProcuradorRepository().find(procuradorIds || [0])
            if (procuradores.length === 0) {
                return { codigoEmpresa, procuradorIds: [] }
            }

            const cpfProcuradores = procuradores.map(p => p.cpf_procurador)
            await UserService.removePermissions({ cpfProcuradores, codigoEmpresa })
            await ProcuradorService.removeEmpresa(procuradores, codigoEmpresa)

            return { codigoEmpresa, procuradorIds }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * O soft delete é utilizado pelo TaskManager para atualizar automaticamente procurações que estiverem vencidas.
     * @returns {Promise<number|false|undefined>} Undefined em caso de erro
     */
    static async softDeleteExpired() {
        try {
            const expiredProcuracoes = await ProcuracaoDaoImpl.getExpiredProcuracoes()
            const expiredCount = expiredProcuracoes.length
            if (expiredCount === 0) {
                return false
            }

            const procuracaoRepository = new Repository('procuracoes', 'procuracao_id')
            const updates = expiredProcuracoes.map(p => ({ procuracao_id: p.procuracao_id, status: 'vencida' }))
            await procuracaoRepository.updateMany(updates)

            for (const { procuracao_id } of expiredProcuracoes) {
                const softDelete = true
                ProcuracaoService.deleteProcuracao(procuracao_id, softDelete)
            }

            return expiredCount
        } catch (error) {
            console.log("🚀 ~ file: ProcuracaoService.js:87 ~ ProcuracaoService ~ softDeleteExpired ~ error:", error)
        }
    }
}

module.exports = { ProcuracaoService }
