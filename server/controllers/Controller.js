//@ts-check
const
    { request, response } = require("express")
    , { Repository } = require("../repositories/Repository")
    , { fieldParser } = require("../utils/fieldParser")
    , userSockets = require("../auth/userSockets")
    , { EntityDaoImpl } = require("../infrastructure/EntityDaoImpl")
    , { CustomSocket } = require("../sockets/CustomSocket")
    , deleteSockets = require("../auth/deleteSockets")
    , { pool } = require("../config/pgConfig")
    , removeEmpresa = require("../users/removeEmpresa");
const { getUpdatedData } = require("../getUpdatedData");


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
        this.update = this.update.bind(this)
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

    async getOne(req, res) {
        const { table, key, value } = req.query
        const condition = `WHERE ${key} = ${value}`
        console.log({ condition })
        const el = await getUpdatedData(table, condition)
        return res.json(el)
    }

    async save(req, res) {

        const { user } = req
        if (user.role !== 'admin')
            return res.status(403).send('É preciso permissão de administrador para acessar essa parte do cadTI.')

        try {
            const id = await this.repository.save(req.body)
            res.status(201).json(id)

            const
                createdEntity = await this.repository.find(id)
                , { codigo_empresa } = createdEntity[0]
                , socket = new CustomSocket(req)
            socket.emit('insertElements', createdEntity, this.table, this.primaryKey, codigo_empresa)
        } catch (error) {
            throw error
        }

    }

    /**      
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


    /**      
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<any>}
     */
    update = async (req, res) => {
        const
            { body } = req
            , { codigo_empresa } = body

        if (Object.keys(body).length <= 1)
            return res.status(409).send('Nothing to update...')

        try {
            const repository = new Repository(this.table, this.primaryKey)
                , exists = await repository.find(req.body[this.primaryKey])

            if (!exists.length)
                return res.status(409).send('Não foi encontrado nenhum registro na base de dados para atualização.')

            await repository.update(body)  //boolean
            res.send(`${this.table} updated.`)

            let updates

            if (Array.isArray(body)) {
                const ids = body.map(el => el[this.primaryKey])
                updates = await repository.find(ids)
            }
            else
                updates = await repository.find(body[this.primaryKey])

            const socket = new CustomSocket(req)
            socket.emit('updateAny', updates, this.table, this.primaryKey, codigo_empresa)

        } catch (error) {
            console.log("🚀 ~ file: Controller.js ~ line 148 ~ Controller ~ update= ~ error", error)
            res.status(500).send(error)
        }
    }

    //*************************REFACTOR THIS PLEASE!!!!!!!!!!!!!!!!! */
    delete = (req, res) => {

        let { id } = req.query
        const
            { user } = req,
            { table, tablePK, codigoEmpresa } = req.query,
            //@ts-ignore
            { collection } = fieldParser.find(f => f.table === table)

        if (user.role !== 'admin' && collection !== 'procuracoes')
            return res.status(403).send('É preciso permissão de administrador para acessar essa parte do cadTI.')

        if (table === 'laudos')
            id = `'${id}'`

        const singleSocket = req.headers.referer && req.headers.referer.match('/veiculos/config')

        const query = ` DELETE FROM public.${table} WHERE ${tablePK} = ${id}`
        //console.log(query, '\n\n', req.query)
        console.log({ table, tablePK, codigoEmpresa })
        pool.query(query, async (err, t) => {
            if (err)
                console.log(err)
            else if (t && id) {
                if (singleSocket) {
                    const io = req.app.get('io')
                    io.sockets.emit('deleteOne', { id, tablePK, collection })
                }
                else {
                    id = id.replace(/\'/g, '')
                    deleteSockets({ req, noResponse: true, table, tablePK, event: 'deleteOne', id, codigoEmpresa })
                    updateUserPermissions()
                }
                res.send(`${id} deleted from ${table}`)
            }
            else res.send('no id found.')
        })

        //*****************************ATUALIZA PERMISSÕES DE USUÁRIOS ******************************** 
        //Se a tabela for socios ou procuradores, chama a função para atualizar a permissão de usuários
        const updateUserPermissions = () => {

            const { codigoEmpresa, cpf_socio, cpf_procurador } = req.query

            if (table === 'socios' || table === 'procuradores')
                removeEmpresa({ representantes: [{ cpf_socio, cpf_procurador }], codigoEmpresa })
        }
    }


    /****TODO: REMOVE THIS SECTION ********
    
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
        } */
}

module.exports = { Controller }