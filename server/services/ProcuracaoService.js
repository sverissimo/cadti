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
     * @returns {Promise<object|false>} object {updatedProcuradores, codigoEmpresa} | false
     */
    static async deleteProcuracao(id) {
        const procuracaoRepository = new Repository('procuracoes', 'procuracao_id')

        try {
            const procuracoes = await procuracaoRepository.find(id)
            if (!procuracoes.length) {
                return false
            }

            const result = await procuracaoRepository.delete(id)
            if (!result) {
                return false
            }

            const { codigo_empresa: codigoEmpresa, procuradores: procuradorIds } = procuracoes[0]
            const procuradores = await new ProcuradorRepository().find(procuradorIds)
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

}

module.exports = { ProcuracaoService }
