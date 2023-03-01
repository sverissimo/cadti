//@ts-check
const { SocioDaoImpl } = require("../infrastructure/SocioDaoImpl")
const { Repository } = require("./Repository")

class SocioRepository extends Repository {
    table = 'socios'
    primaryKey = 'socio_id'
    entityManager = new SocioDaoImpl()

    /**
     * @override
     * @param {object} empresas :number[], role: string
     * @returns {Promise<object[]>} Retorna os socios criados.
     */
    list = async ({ empresas, role }) => {
        try {
            const socios = await this.entityManager.list({ empresas, role })
            return socios
        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }

    /** Busca com base no id ou parâmetro informado e retorna sócios com JSON parsed empresas
   * @override
   * @param {string | object | Array<string | number>} filter - Id ou filtro (objeto key/value para servir de param para a busca ou array de ids)
   * @returns {Promise<any[]>} Array com registros do DB conforme filtro passado como parâmetro
   */
    find = async (filter) => {
        try {
            const data = await this.entityManager.find(filter)
            const socios = data && data.map(s => ({ ...s, empresas: JSON.parse(s.empresas) }))
            return socios
        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }
}

module.exports = SocioRepository
