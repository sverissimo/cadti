//@ts-check
const
    { request, response } = require("express")
    , EntityRepository = require("./EntityRepository")
    , { getUpdatedData } = require("../getUpdatedData")


/**
 * Classe que corresponde ao repositório de veículos. Herda o método get da classe parent Entity
 */
class VeiculosRepository extends EntityRepository {

    constructor() {
        super()
    }


    /**
     * @param req {request} 
     * @param res {response}
     * @returns {Promise<void>}
     */
    async create(req, res) {

    }
}


module.exports = VeiculosRepository