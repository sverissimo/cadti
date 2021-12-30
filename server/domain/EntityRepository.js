//@ts-check
const
    { request, response } = require("express")
    , { getUpdatedData } = require("../getUpdatedData")
    , { pool: PgPool } = require("../config/pgConfig")
    , { parseRequestBody } = require("../parseRequest")


/**
 * Classe parent genérica que estabelece o método get padrão
 */
class EntityRepository {


    /**
     * @property condition - prop para a child class utilizar caso necessário;
     * @type {string}
     */
    condition;

    /**
     * @property pool - conexão com o postgreSql, em config/pgPool
     */
    pool = PgPool;


    parseRequestBody = parseRequestBody;

    /**
     * Lista as entradas de uma determinada tabela
     * @param req {request} 
     * @param res {response}
     * @returns {Promise<void>}
    */
    async list(req, res) {
        try {
            const
                { condition, table } = res.locals
                , data = await getUpdatedData(table, condition || '')
            console.log("🚀 ~ file: EntityRepository.js ~ line 21", { table })
            res.json(data)

        } catch (error) {
            console.log({ error: error.message })
            res.status(400).send(error)
        }
    }
}

module.exports = EntityRepository