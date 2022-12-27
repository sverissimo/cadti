//@ts-check
const ProcuradorRepository = require("../repositories/ProcuradorRepository")
const { Repository } = require("../repositories/Repository")

// Módulo criado para evitar circular references de importações entre serviços
/**
* @param {string|string[]} cpfs
* @return {Promise<string[]>} cpfSocios
*/
const isSocio = async (cpfs) => {
    try {
        const socios = await new Repository('socios', 'cpf_socio').find(cpfs)
        const cpfSocios = socios.map(s => s.cpf_socio)
        return cpfSocios
    } catch (error) {
        throw new Error(error.message)
    }
}

/**
* @param {string|string[]} cpfs
* @return {Promise<string[]>} cpfProcuradores
*/
const isProcurador = async (cpfs) => {
    try {
        const procuradores = await new Repository('procuradores', 'cpf_procurador').find(cpfs)
        const cpfProcuradores = procuradores.map(p => p.cpf_procurador)
        return cpfProcuradores
    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * @typedef CheckProcuracaoInput
 * @property {any[]} procuradores
 * @property {any[]} [procuracoes]
 * @property {number} [codigoEmpresa]
 * @param {CheckProcuracaoInput} checkProcuracaoInput
 * @return {Promise<string[]>} cpfsToKeep
 */
const hasOtherProcuracao = async ({ procuradores, procuracoes, codigoEmpresa }) => {

    if (!procuracoes || !procuracoes.length) {
        procuracoes = await new Repository('procuracoes', 'procuracao_id').list()
    }

    const cpfsToKeep = []
    procuradores.forEach(({ procurador_id, cpf_procurador }) => {
        //@ts-ignore
        const procuracoesWithThisProcurador = procuracoes
            .filter(p => {
                let filterCondition = p.procuradores.includes(procurador_id)
                if (codigoEmpresa) {
                    filterCondition = filterCondition && p.codigo_empresa === codigoEmpresa
                }

                return filterCondition
            })

        const hasOtherProcuracoes = codigoEmpresa ?
            procuracoesWithThisProcurador.length >= 2
            :
            procuracoesWithThisProcurador.length >= 1

        if (hasOtherProcuracoes) {
            cpfsToKeep.push(cpf_procurador)
        }
    })
    return cpfsToKeep
}

module.exports = {
    hasOtherProcuracao,
    isProcurador,
    isSocio,
}