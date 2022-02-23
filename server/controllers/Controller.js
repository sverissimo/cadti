//@ts-check
const
    { request, response } = require("express")
    , { Repository } = require("../repositories/Repository")
    , { fieldParser } = require("../utils/fieldParser")
    , userSockets = require("../auth/userSockets")
    , { EntityDaoImpl } = require("../infrastructure/EntityDaoImpl")
    , { CustomSocket } = require("../sockets/CustomSocket")


/**Classe parent de controlador para os requests de acesso ao banco de dados Postgresql.
 * @class
 */
class Controller {

    /**
     * @property {} table @type {string}     */
    table;
    /**
     * @property {} primaryKey @type {string}     */
    primaryKey;

    /**
     *  @property {} repository @type {Repository}     */
    repository;

    /**     
     * @param {string} [table]
     * @param {string} [primaryKey]
     * @param {Repository} [repository]
     */
    constructor(table, primaryKey, repository) {
        this.table = this.table || table
        this.primaryKey = this.primaryKey || primaryKey
        this.repository = repository || new Repository(this.table, this.primaryKey)
        this.save = this.save.bind(this)
        this.saveMany = this.saveMany.bind(this)
    }

    /**     
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<any>}
     */
    list = async (req, res) => {

        const { filter } = res.locals

        if (req.params.id || Object.keys(req.query).length)
            return this.find(req, res)

        try {
            const collection = await this.repository.list(filter)
            res.status(200).json(collection)

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
    async find(req, res) {

        const filter = req.params.id || req.query
        try {
            const entity = await this.repository.find(filter)
            return res.status(200).json(entity)

        } catch (e) {
            console.log(e.name + ': ' + e.message)
            res.status(500).send(e)
        }
    }

    async save(req, res) {
        console.log("🚀 ~ file: Controller.js ~ line 80 ~ Controller ~ save ~ req", req.body)

        const { user } = req
        if (user.role !== 'admin')
            return res.status(403).send('É preciso permissão de administrador para acessar essa parte do cadTI.')

        try {
            const id = await this.repository.save(req.body)
            res.status(201).json(id)

            const
                createdEntity = this.repository.find(id)
                , socket = new CustomSocket(req)
            socket.emit('insertElements', createdEntity)


            /* const condition = `WHERE ${this.table}.${this.primaryKey} = '${id}'`

            //@ts-ignore
            await userSockets({ req, table: this.table, condition, event: this.event || 'insertElements', noResponse: true }) */

        } catch (error) {

        }

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


    /** Retorna a condição de filtro para passar como parâmetro para a função que gera o webSocket de atualização de dados
     * @param {number| string|Array<number | string>} id 
     */
    getSocketFilter(id) {
        let socketFilter

        if (Array.isArray(id)) {
            const ids = id
            ids.forEach(id => socketFilter = `socio_id = '${id}' OR `)
            socketFilter = 'WHERE ' + socketFilter
            socketFilter = socketFilter.slice(0, socketFilter.length - 3)
            return socketFilter
        }
        socketFilter = `WHERE ${this.primaryKey} = ${id}`
        return socketFilter
    }

}

module.exports = { Controller }