//@ts-check
const { SocioDaoImpl } = require("../infrastructure/SocioDaoImpl")
const { Repository } = require("../repositories/Repository")
const { UserService } = require("./UserService")
const { isProcurador, hasOtherProcuracao } = require("./utilServices")

class SocioService {

    /**
     * @param {string[]} cpfs
     * @returns {Promise<object[]>} socios
     */
    static async checkSocios(cpfs) {
        let socios = await new SocioDaoImpl().checkSocios(cpfs)
        if (socios.length === 1) {
            socios = socios[0]
        }
        return socios
    }

    static updateSocios = async ({ socios, codigoEmpresa, cpfsToAdd = [], cpfsToRemove = [] }) => {
        try {
            socios.forEach(s => {
                if (cpfsToRemove.includes(s.cpf_socio)) {
                    const idx = s.empresas.indexOf(e => e.codigoEmpresa === codigoEmpresa)
                    s.empresas.splice(idx, 1)
                }
                s.empresas = JSON.stringify(s.empresas)
            })

            console.log("🚀 ~ file: SocioService.js:27 ~ SocioService ~ updateSocios= ~ socios", socios)
            const result = await new SocioDaoImpl().updateMany(socios)

            if (cpfsToAdd.length) {
                const sociosToAdd = socios.filter(s => cpfsToAdd.includes(s.cpf_socio))
                await UserService.addPermissions(sociosToAdd, codigoEmpresa)
            }

            if (cpfsToRemove.length) {
                await this.removeSociosPermissions({ cpfsToRemove, codigoEmpresa })
            }

            return result
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * @typedef {object} saveManySociosRequest
     * @property {number} codigoEmpresa
     * @property {object[]} socios
     * @param {saveManySociosRequest}  request - array de sócios e códigoEmpresa
     * @returns {Promise<number[]>} socio_ids
     */
    static saveMany = async ({ codigoEmpresa, socios }) => {
        try {
            const parsedSocios = SocioService.addEmpresaAndShareArray(codigoEmpresa, socios)
            const ids = await new SocioDaoImpl().saveMany(parsedSocios)
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

    /**
    * @typedef {object} removeEmpresaRequest
    * @property {number} codigoEmpresa
    * @property {string[]} cpfsToRemove
    * @param {removeEmpresaRequest}  request - array de sócios e códigoEmpresa
    * @returns {Promise<any>} socio_ids
    */
    static async removeSociosPermissions({ codigoEmpresa, cpfsToRemove: cpfs }) {
        const alsoProcuradores = await isProcurador(cpfs)
        let hasProcuracao

        if (alsoProcuradores.length) {
            hasProcuracao = await hasOtherProcuracao({
                codigoEmpresa,
                cpfs,
            })
        }
        console.log("🚀 ~ file: SocioService.js:83 ~ SocioService ~ removeSociosFromEmpresa ~ alsoProcuradores", alsoProcuradores)
        console.log("🚀 ~ file: SocioService.js:102 ~ SocioService ~ removeSociosFromEmpresa ~ hasProcuracao", hasProcuracao)

        const cpfsToRemove = cpfs.filter(cpf => !hasProcuracao.includes(cpf))
        console.log("🚀 ~ file: SocioService.js:105 ~ SocioService ~ removeSociosFromEmpresa ~ cpfsToRemove", cpfsToRemove)
        if (cpfsToRemove.length) {
            const permissionUpdate = await UserService.removePermissions({ cpfSocios: cpfsToRemove, codigoEmpresa })
            console.log("SocioService.js:100 ~ deleteSocio ~ permissionUpdate: ", permissionUpdate)
        }

        return cpfsToRemove
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
                cpfs: [cpf_socio],
            })
            hasProcuracao = procuracaoSearch.length > 0
        }

        if (!hasProcuracao) {
            const permissionUpdate = await UserService.removePermissions({ cpfSocios: [cpf_socio], codigoEmpresa })
            //console.log("SocioService.js:100 ~ deleteSocio ~ permissionUpdate: ", permissionUpdate)
        }

        const result = await socioRepository.delete(id)
        return result
    }
}

module.exports = { SocioService }
