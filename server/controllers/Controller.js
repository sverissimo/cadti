//@ts-check
const
    { request, response } = require("express")
    , { Repository } = require("../repositories/Repository")
    , { fieldParser } = require("../utils/fieldParser");
const userSockets = require("../auth/userSockets");
const { EntityDaoImpl } = require("../infrastructure/EntityDaoImpl");

/**
 * @class
 */
class Controller {

    /**
     * @property {string} table
     * @type {string}     */
    table;

    /**
     * @property {string} primaryKey
     * @type {string}     */
    primaryKey;


    /**
    * @property {string} primaryKey
    * @type {string}     */
    event;


    constructor(table, primaryKey) {
        this.table = table
        this.primaryKey = primaryKey
        this.save = this.save.bind(this)
        this.saveMany = this.saveMany.bind(this)
    }

    /**     
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<any>}
     */
    async find(req, res) {

        const
            filter = req.params.id || req.query
            , repository = new Repository(this.table, this.primaryKey)

        try {
            const entity = await repository.find(filter)
            return res.status(200).json(entity)

        } catch (e) {
            console.log(e.name + ': ' + e.message)
            res.status(500).send(e)
        }
    }


    /**     
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<any>}
     */
    list = async (req, res) => {

        const repository = new Repository(this.table, this.primaryKey)
        try {
            const collection = await repository.list()
            res.status(200).json(collection)

        } catch (e) {
            console.log(e.name + ': ' + e.message)
            res.status(500).send(e)
        }
    }

    async save(req, res) {
        const { user } = req
        if (user.role !== 'admin')
            return res.status(403).send('É preciso permissão de administrador para acessar essa parte do cadTI.')

        const
            entityDaoImpl = new EntityDaoImpl(this.table, this.primaryKey)
            , id = await entityDaoImpl.saveMany(req.body)

        res.send(id)
        const condition = `WHERE ${this.primaryKey} = '${id}'`

        //@ts-ignore
        await userSockets({ req, res, table: this.table, condition, event: this.event || 'insertElements', noResponse: true })
    }

    /**
     * 
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<any>}
     */
    async saveMany(req, res) {

        const
            entityDaoImpl = new EntityDaoImpl(this.table, this.primaryKey)
            , entities = req.body.socios || req.body.procuradores
            , ids = await entityDaoImpl.saveMany(entities)

        res.send(ids)

        let condition
        ids.forEach(id => condition = `${this.primaryKey} = '${id}' OR `)
        condition = 'WHERE ' + condition
        condition = condition.slice(0, condition.length - 3)
        //@ts-ignore
        await userSockets({ req, res, table: this.table, condition, event: this.event || 'insertElements', noResponse: true })

    }


    update = async (req, res) => {
        const
            { user } = req,
            { table, tablePK, column, requestArray } = req.body,
            { collection } = fieldParser.find(el => el.table === table)
        let
            queryString = ''

        //Checa permissão de admin
        if (user.role === 'empresa')
            return res.status(403).send('Esse usuário não possui permissões para acessar essa parte do cadTI.')
        //Request vazio
        if (!requestArray && !requestArray[0])
            return res.send('nothing to update...')
    }

    delete = async (req, res) => {
        let { id } = req.query
        const
            { user } = req,
            { table, tablePK, codigoEmpresa } = req.query,
            { collection } = fieldParser.find(f => f.table === table)

        if (user.role !== 'admin' && collection !== 'procuracoes')
            return res.status(403).send('É preciso permissão de administrador para acessar essa parte do cadTI.')

        if (table === 'laudos')
            id = `'${id}'`

        const singleSocket = req.headers.referer && req.headers.referer.match('/veiculos/config')

    }
}

module.exports = { Controller }