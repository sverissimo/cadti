//@ts-check
const { EmpresaDaoImpl } = require("../infrastructure/EmpresaDaoImpl")

class EmpresaService {

    /**
     * @param {object} param0
     * @returns {Promise<Object>}
     */
    static async saveEmpresaAndSocios({ empresa, socios }) {
        const result = await new EmpresaDaoImpl().saveEmpresaAndSocios({ empresa, socios })
        const { codigo_empresa, socio_ids } = result
        return { codigo_empresa, socio_ids }
    }
}

module.exports = { EmpresaService }