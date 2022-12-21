//@ts-check
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
     * @returns {Promise<object|false>} {procuradores, codigoEmpresa} | false
     */
    static async deleteProcuracao(id) {
        try {
            const procuracaoRepository = new Repository('procuracoes', 'procuracao_id')
            const queryResult = await procuracaoRepository.find(id)
            if (!queryResult.length) {
                return false
            }
            const procuracao = queryResult[0]
            const { codigo_empresa } = procuracao
            const procuradorIds = procuracao.procuradores
            const procuradores = await ProcuradorService.removeProcuracao(procuradorIds, codigo_empresa)
            if (!procuradores) {
                return false
            }

            const cpfProcuradores = procuradores.map(p => p.cpf_procurador)
            const socios = await new Repository('socios', 'cpf_socio').find(cpfProcuradores)
            const cpfsToKeep = socios.map(s => s.cpf_socio)
            console.log("🚀 ~ file: ProcuracaoService.js:30 ~ ProcuracaoService ~ deleteProcuracao ~ cpfsToKeep", cpfsToKeep)
            const cpfsToRemove = cpfProcuradores.filter(cpf => !cpfsToKeep.includes(cpf))
            console.log("🚀 ~ file: ProcuracaoService.js:31 ~ ProcuracaoService ~ deleteProcuracao ~ cpfsToRemove", cpfsToRemove)

            await UserService.removePermissions(cpfsToRemove, codigo_empresa)

            const result = await procuracaoRepository.delete(id)
            if (!result) {
                return false
            }

            return { procuradores, codigoEmpresa: codigo_empresa }

        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = { ProcuracaoService }
