//@ts-check
const { SocioDaoImpl } = require("../infrastructure/SocioDaoImpl")
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
}

module.exports = { SocioService }