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
}

module.exports = SocioRepository
