//@ts-check
const { SocioDaoImpl } = require("../infrastructure/SocioDaoImpl")
const { Repository } = require("../repositories/Repository")
const insertEmpresa = require("../users/insertEmpresa")
const { UserService } = require("./UserService")
const { isProcurador, hasOtherProcuracao } = require("./utilServices")

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
        console.log("🚀 ~ file: SocioService.js:34 ~ SocioService ~ saveMany= ~ codigoEmpresa", codigoEmpresa)
        try {
            const parsedSocios = SocioService.addEmpresaAndShareArray(codigoEmpresa, socios)
            const ids = await new SocioDaoImpl().saveMany(parsedSocios)
            console.log("🚀 ~ file: SocioService.js:38 ~ SocioService ~ saveMany= ~ codigoEmpresa", codigoEmpresa)
            if (codigoEmpresa) {
                await UserService.addPermissions(socios, codigoEmpresa)
            }

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

    static async deleteSocio(id, codigoEmpresa) {
        const socioRepository = new Repository('socios', 'socio_id')
        const socioToDelete = await socioRepository.find(id)

        if (!socioToDelete.length) {
            return false
        }

        const { cpf_socio } = socioToDelete[0]
        const procuradorSearch = await isProcurador(cpf_socio)
        const isAlsoProcurador = procuradorSearch.length > 0
        let hasProcuracao

        if (isAlsoProcurador) {
            const procuracaoSearch = await hasOtherProcuracao({
                codigoEmpresa,
                procuradores: [cpf_socio],
            })
            hasProcuracao = procuracaoSearch.length > 0
        }

        if (!hasProcuracao) {
            const permissionUpdate = await UserService.removePermissions(cpf_socio, codigoEmpresa)
            console.log("SocioService.js:100 ~ deleteSocio ~ permissionUpdate: ", permissionUpdate)
        }

        const result = await socioRepository.delete(id)
        return result
    }
}

module.exports = { SocioService }
