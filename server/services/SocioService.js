//@ts-check
const humps = require("humps")
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

    static updateSocios = async ({ socios, codigoEmpresa }) => {
        try {
            const updatedSocios = this.updateEmpresas(socios, codigoEmpresa)
            const update = humps.decamelizeKeys(updatedSocios)
            const result = await new SocioDaoImpl().updateMany(update)

            const cpfsToAdd = socios
                .filter(s => s.outsider)
                .map(s => s.cpfSocio)

            if (cpfsToAdd.length) {
                console.log("🚀 ~ file: SocioService.js:33 ~ SocioService ~ updateSocios= ~ cpfsToAdd", cpfsToAdd)
                await UserService.addPermissions(cpfsToAdd, codigoEmpresa)
            }

            const cpfsToRemove = socios
                .filter(s => s.status === 'deleted')
                .map(s => s.cpfSocio)

            if (cpfsToRemove.length) {
                console.log("🚀 ~ file: SocioService.js:41 ~ SocioService ~ updateSocios= ~ cpfsToRemove", cpfsToRemove)
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
            const ids = await new SocioDaoImpl().saveMany(humps.decamelizeKeys(parsedSocios))
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
        for (const socio of socios) {
            const { share } = socio
            const empresas = [{ codigoEmpresa, share }]
            socio.empresas = JSON.stringify(empresas)
            delete socio.share
        }

        return socios
    }

    static updateEmpresas(socios, codigoEmpresa) {

        for (const s of socios) {
            const idx = s.empresas.findIndex(e => e.codigoEmpresa === codigoEmpresa)
            if (s.outsider) {
                s.empresas.push({ codigoEmpresa, share: Number(s.share) })
            }
            else if (s.status === 'deleted') {
                s.empresas.splice(idx, 1)
            } else {
                s.empresas[idx] = { ...s.empresas[idx], share: Number(s.share) }
            }
        }

        const updatedSocios = socios.map(s => {
            const { share, outsider, status, empresas, ...socio } = s
            socio.empresas = JSON.stringify(empresas)
            return socio
        })

        return updatedSocios
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
