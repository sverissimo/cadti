//@ts-check
const VeiculoDaoImpl = require("../infrastructure/VeiculoDaoImpl")
const { Repository } = require("./Repository")

/**Classe que corresponde ao repositório de veículos. Herda os métodos get e pool (pgConfig) da classe parent EntityRepository
 *  @class
 */
class VeiculoRepository extends Repository {

    constructor() {
        super()
        this.entityManager = new VeiculoDaoImpl()
    }
    /**
     * @param vehicle {Object}
     * @returns {Promise<void | number>} Retorna o id do veículo criado / throws an error.
     */
    async create(vehicle) {
        try {
            const veiculoId = await new VeiculoDaoImpl().save(vehicle)
            return veiculoId
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * @override
     * @param {Object} vehicle
     * @returns {Promise<string>}
     */
    async update(vehicle) {
        try {
            const veiculoId = await new VeiculoDaoImpl().update(vehicle)
            return veiculoId
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = VeiculoRepository
