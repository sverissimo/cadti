//@ts-check
const { EntityDaoImpl } = require("../infrastructure/EntityDaoImpl")

/** @class Classe parent genérica que estabelece o padrão de métodos de acesso a dados */
class Repository {
    /**
    * @property table - nome da tabela vinculada à entidade;
    *  @type {string}*/
    table;

    /**
    * @property primaryKey - nome da coluna referente ao ID da tabela;
    * @type {string}*/
    primaryKey;

    /**
     * @property entityManager - objeto que implementa o DAO, responsável pela comunicação com o Banco de Dados
     * @type {EntityDaoImpl}*/
    entityManager;

    /**
     * @param {string} [table]
     * @param {string} [primaryKey]
     */
    constructor(table, primaryKey) {
        this.table = String(table)
        this.primaryKey = String(primaryKey)
        this.entityManager = new EntityDaoImpl(this.table, this.primaryKey)
    }

    /** Lista todos os objetos (rows) de uma tabela
    * @param {string} filter - filtro de permissões de usuário passado pela classe Controller.js
    * @returns {Promise<any[]>} Objetos de uma tabela do DB
    */
    list = async (filter = '') => {
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
    * @returns {Promise<any[]>} Array com registros do DB conforme filtro passado como parâmetro
    */
    find = async (filter) => {
        try {
            const data = await this.entityManager.find(filter)
            return data
        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }

    /** @returns {Promise<boolean>} */
    checkIfExists = async ({ column, value }) => {
        try {
            const searchResult = await this.entityManager.find({ [column]: value })
            const itemExists = !!searchResult.length
            return itemExists
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * @param {Object} entity
     * @returns {Promise<number | string>} ID do registro criado no DB.
     */
    save = async (entity) => {
        try {
            const id = await this.entityManager.save(entity)
            return id
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
    * @param {Object} element
    * @returns {Promise<boolean>}
    */
    update = async (element) => {
        try {
            const result = await this.entityManager.update(element)
            return result
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * @param {any[]} elements
     * @returns {Promise<boolean>}
     */
    updateMany = async (elements) => {
        try {
            const result = await this.entityManager.updateMany(elements)
            return result
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * @param {string|number} id
     * @returns {Promise<boolean>} result (boolean)
     */
    delete = async (id) => {
        try {
            const result = await this.entityManager.delete(id)
            return result
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = { Repository }
