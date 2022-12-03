//@ts-check
const
    { parseRequestBody } = require("../utils/parseRequest")
    , { EntityDaoImpl } = require("../infrastructure/EntityDaoImpl")


/** @class Classe parent genérica que estabelece o padrão de métodos de acesso a dados */
class Repository {
    /**
  * @property table - nome da tabela vinculada à entidade; @type {string}     */
    table;

    /**
    * @property primaryKey - nome da coluna referente ao ID da tabela; @type {string}     */
    primaryKey;

    /**
     * @property condition - prop para a child class utilizar caso necessário; @type {string}
     */
    condition;

    parseRequestBody = parseRequestBody;

    /**      
     * @param {string} [table] 
     * @param {string} [primaryKey]
     * @param {any} [daoImplementation]
     */
    constructor(table, primaryKey, daoImplementation) {
        if (!this.table)
            this.table = table

        if (!this.primaryKey)
            this.primaryKey = primaryKey
        //this.entityManager = daoImplementation || new EntityDaoImpl(this.table, this.primaryKey)
        this.entityManager = new EntityDaoImpl(this.table, this.primaryKey)
        this.list = this.list.bind(this)
        this.find = this.find.bind(this)
        this.update = this.update.bind(this)
    }

    /** Lista todos os objetos (rows) de uma tabela
     * @returns {Promise<any[]>}
     */
    async list(filter) {
        try {
            const data = await this.entityManager.list(filter)
            return data

        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }


    /** Busca com base no id ou parâmetro informado
    * @param {string | object | Array<string | number>} filter - Id ou filtro (objeto key/value para servir de param para a busca ou array de ids)
    * @returns {Promise<any[]>} Promise, collection
    */
    async find(filter) {
        try {
            const data = await this.entityManager.find(filter)
            return data

        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }


    /**     
     * @param {Object} entity 
     * @returns {Promise<number | string>}
     */
    async save(entity) {

        try {
            const id = await this.entityManager.save(entity)
            return id

        } catch (error) {
            console.log("🚀 ~ file: Repository.js ~ line 56 ~ Repository ~ save ~ error", error.message)
            throw new Error(error.message)
        }
    }
    /**
        * @param {Object} element 
        * @returns {Promise<any>} 
        */
    async update(element) {
        try {
            const
                entityManager = new EntityDaoImpl(this.table, this.primaryKey)
                , result = await entityManager.update(element)
            console.log("🚀 ~ file: Repository.js ~ line 97 ~ Repository ~ update ~ result", result)
            return result
        } catch (error) {
            console.log("🚀 ~ file: Repository.97 ~ line 97 ~ Repository ~ update ~ error", error.message)
            throw new Error(error.message)
        }
    }
}

module.exports = { Repository }