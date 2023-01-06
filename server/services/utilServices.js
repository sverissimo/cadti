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
 * @param {object} procurador
 * @return {Promise<boolean>} hasAnyProcuracao
 */
const hasAnyProcuracao = async (procurador) => {
    const procuracoes = await new Repository('procuracoes', 'procuracao_id').list()
    const hasAnyProcuracao = procuracoes.filter((doc) => doc.procuradores && doc.procuradores.includes(procurador.procurador_id))
    return !!hasAnyProcuracao.length
}

/**
 * @typedef CheckProcuracaoInput
 * @property {string[]} cpfs
 * @property {number} codigoEmpresa
 * @param {CheckProcuracaoInput} checkProcuracaoInput
 * @return {Promise<string[]>} cpfsToKeep
 */
const hasOtherProcuracao = async ({ cpfs, codigoEmpresa }) => {
    const procuracoes = await new Repository('procuracoes', 'procuracao_id').find({ codigo_empresa: codigoEmpresa })
    if (!procuracoes.length) {
        return []
    }
    //const cpfsToSearch = cpfProcuradores.concat(cpfSocios)
    const procuradores = await new ProcuradorRepository().find({ cpf_procurador: cpfs })
    if (!procuradores.length) {
        return []
    }

    const cpfsToKeep = []
    procuradores.forEach(({ procurador_id, cpf_procurador }) => {
        const procuracoesWithThisProcurador = procuracoes.filter(p => p.procuradores.includes(procurador_id))
        const hasOtherProcuracoes = procuracoesWithThisProcurador.length >= 1
        if (hasOtherProcuracoes) {
            cpfsToKeep.push(cpf_procurador)
        }
    })
    return cpfsToKeep
}

module.exports = {
    hasAnyProcuracao,
    hasOtherProcuracao,
    isProcurador,
    isSocio,
}
