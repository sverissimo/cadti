//@ts-check
const { SocioDaoImpl } = require("../infrastructure/SocioDaoImpl")
const { Repository } = require("../repositories/Repository")
const insertEmpresa = require("../users/insertEmpresa")

//@ts-check
class SocioService {

    /**
     * @param {string[]} cpfs
     * @returns {Promise<object[]>} socios
     */
    static async checkSocios(cpfs) {
        const socios = await new SocioDaoImpl().checkSocios(cpfs)
        return socios
    }

    /**
     * @param {string|string[]} cpfs
     * @return {Promise<string[]>} cpfSocios
     */
    static async isSocio(cpfs) {
        try {
            const socios = await new Repository('socios', 'cpf_socio').find(cpfs)
            const cpfSocios = socios.map(s => s.cpf_socio)
            return cpfSocios
        } catch (error) {
            throw new Error(error.message)
        }
    }

    static updateSocios = async ({ socios, codigoEmpresa, cpfsToAdd }) => {
        try {
            const result = await new SocioDaoImpl().updateMany(socios)
            //Atualiza a permissão dos usuários conforme atualização dos sócios
            if (cpfsToAdd && cpfsToAdd[0]) {
                insertEmpresa({ representantes: cpfsToAdd, codigoEmpresa })
            }

            return result
        } catch (error) {
            throw new Error(error.message)
        }
    }

    static saveMany = async ({ codigoEmpresa, socios }) => {
        try {
            const parsedSocios = SocioService.addEmpresaAndShareArray(codigoEmpresa, socios)
            const ids = await new SocioDaoImpl().saveMany(parsedSocios)
            return ids
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /** Insere a coluna empresas [{codigoEmpresa, share}] para cada sócio
       * @param {number | string} codigoEmpresa
       * @param {Array<any>} socios
       * @returns {Array<any>} socios
       */
    static addEmpresaAndShareArray(codigoEmpresa, socios) {
        for (let socio of socios) {
            //Os sócios podem já ter cadastro no sistema (outra empresa) ou ser novos
            let { empresas, share } = socio
            if (empresas && empresas instanceof Array)
                empresas.push({ codigoEmpresa, share })
            //Os novos não vêm com a coluna 'empresas' do frontEnd (req.body)
            else
                empresas = [{ codigoEmpresa, share }]

            socio.empresas = empresas
            socio.empresas = JSON.stringify(empresas)
        }
        return socios
    }

    /* static async deleteProcurador(id, codigoEmpresa) {
        const procuradorRepository = new ProcuradorRepository()
        const procuradorToDelete = await procuradorRepository.find(id)
        if (!procuradorToDelete.length) {
            return false
        }
        const procuracoesUpdate = true

        const { cpf_procurador } = procuradorToDelete[0]
        const isSocio = await SocioService.isSocio(cpf_procurador)
        const hasProcuracao = await ProcuracaoService.hasOtherProcuracao({
            codigoEmpresa,
            procuradores: procuradorToDelete,
        })

        if (!isSocio.length && !hasProcuracao.length) {
            const permissionUpdate = await UserService.removePermissions(cpf_procurador, codigoEmpresa)
            console.log("ProcuradorService.js:79 ~ deleteProcurador ~ permissionUpdate: ", permissionUpdate)
        }


        const result = await procuradorRepository.delete(id)
        return result
    } */
}

module.exports = { SocioService }