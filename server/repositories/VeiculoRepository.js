//@ts-check
const VeiculoDaoImpl = require("../infrastructure/VeiculoDaoImpl")

/**Classe que corresponde ao repositório de veículos. Herda os métodos get e pool (pgConfig) da classe parent EntityRepository
 *  @class
 */
class VeiculoRepository {

    /** Busca com base no id ou parâmetro informado
     * @param filter {string | object}
     * @returns {Promise<any[]>}         
    */
    async find(filter) {
        try {
            const data = await new VeiculoDaoImpl().find(filter)
            return data

        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }

    /**Lista as entradas de uma determinada tabela
     * @returns {Promise<any[]>}
     */
    async list() {
        try {
            const data = await new VeiculoDaoImpl().list()
            return data

        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
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
            console.log("🚀 ~ file: VeiculoRepository.js ~ line 54 ~ VeiculoRepository ~ create ~ error", error.message)
            throw new Error(error.message)
        }
    }

    async update(vehicle) {
        try {
            const veiculoId = await new VeiculoDaoImpl().update(vehicle)
            return veiculoId

        } catch (error) {
            console.log("🚀 ~ file: VeiculoRepository.js ~ line 54 ~ VeiculoRepository ~ create ~ error", error.message)
            throw new Error(error.message)
        }
    }
}


module.exports = VeiculoRepository