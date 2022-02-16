//@ts-check
const
    { parseRequestBody } = require("../utils/parseRequest")
    , { EntityDaoImpl } = require("../infrastructure/EntityDaoImpl")


/** @class Classe parent genérica que estabelece o padrão de métodos de acesso a dados */
class Repository {
    /**
  * @property table - nome da tabela vinculada à entidade
  * @type {string}     */
    table;

    /**
    * @property primaryKey - nome da coluna referente ao ID da tabela
    * @type {string}     */
    primaryKey;

    /**
     * @property condition - prop para a child class utilizar caso necessário;
     * @type {string}
     */
    condition;

    parseRequestBody = parseRequestBody;

    /**
     * 
     * @param {string} [table] 
     * @param {string} [primaryKey]     */
    constructor(table, primaryKey) {
        this.table = table
        this.primaryKey = primaryKey
        this.list = this.list.bind(this)
        this.find = this.find.bind(this)
    }

    async list() {
        try {
            const
                entityDao = new EntityDaoImpl(this.table, this.primaryKey)
                , data = await entityDao.list()
            return data

        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }


    /** Busca com base no id ou parâmetro informado
    * @param {string | object} filter
    * @returns {Promise<any[]>}             */
    async find(filter) {
        try {
            const data = await new EntityDaoImpl(this.table, this.primaryKey).find(filter)
            return data

        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }

    async save(entity) {

        try {
            const id = await new EntityDaoImpl(this.table, this.primaryKey)
                .save(entity)

            return id

        } catch (error) {
            console.log("🚀 ~ file: Repository.js ~ line 56 ~ Repository ~ save ~ error", error.message)
            throw new Error(error.message)
        }
    }
}

module.exports = { Repository }