//@ts-check
const VeiculoDaoImpl = require("../infrastructure/VeiculoDaoImpl")
const { Repository } = require("./Repository")

/**Classe que corresponde ao repositório de veículos. Herda os métodos get e pool (pgConfig) da classe parent EntityRepository
 *  @class
 */
class VeiculoRepository extends Repository {

    constructor() {
        //super('veiculos', 'veiculo_id')
        super()
        this.entityManager = new VeiculoDaoImpl()
    }
    /**
     * @param vehicle {Object}
     * @returns {Promise<void | number>} Retorna o id do veículo criado / throws an error.
     */
    async create(vehicle) {
        try {
            const veiculoId = await this.entityManager.save(vehicle)
            return veiculoId
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = VeiculoRepository
