//@ts-check
const { request, response } = require("express")
const Entity = require("./EntityRepository");

/**
 * Classe que corresponde ao repositório de veículos. Herda o método get da classe parent Entity
 */
class Empresas extends Entity {

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


module.exports = Empresas