//@ts-check
const { request, response } = require("express")
const { Repository } = require("../repositories/Repository")
const { fieldParser } = require("../utils/fieldParser")
const userSockets = require("../auth/userSockets")
const { EntityDaoImpl } = require("../infrastructure/EntityDaoImpl")
const { CustomSocket } = require("../sockets/CustomSocket")
const deleteSockets = require("../auth/deleteSockets")
const { pool } = require("../config/pgConfig")
const removeEmpresa = require("../users/removeEmpresa");
const { getUpdatedData } = require("../getUpdatedData");
const updateVehicleStatus = require("../taskManager/veiculos/updateVehicleStatus");
const { parseRequestBody } = require("../utils/parseRequest");

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
     * @property {} socketEvent @type {string}     */
    socketEvent;
    /**
     *  @property {} repository @type {Repository}     */
    repository;

    /**
     * @param {string} [table]
     * @param {string} [primaryKey]
     * @param {Repository} [repository]
     */
    constructor(table = '', primaryKey = '', repository) {
        this.table = this.table || table
        this.primaryKey = this.primaryKey || primaryKey
        this.repository = repository || new Repository(this.table, this.primaryKey)
        this.getOne = this.getOne.bind(this)
        this.findMany = this.findMany.bind(this)
        this.save = this.save.bind(this)
        this.update = this.update.bind(this)
    }

    /**
     * @param {request} req
     * @param {response} res
     * @returns {Promise<any>}
     */
    list = async (req, res, next) => {
        const { filter } = res.locals

        if (req.params.id || Object.keys(req.query).length) {
            return this.find(req, res, next)
        }
        try {
            const collection = await this.repository.list(filter)
            res.status(200).json(collection)
        } catch (e) {
            console.log(e.name + ': ' + e.message)
            next(e)
        }
    }

    /**
     * @param {request} req
     * @param {response} res
     * @returns {Promise<any>}
     */
    async find(req, res, next) {
        const filter = req.params.id || req.query
        try {
            const entity = await this.repository.find(filter)
            return res.status(200).json(entity)
        } catch (error) {
            next(error)
        }
    }

    async findMany(req, res, next) {
        const { table, primaryKey } = req.query
        const ids = JSON.parse(req.query.ids)

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).send('No valid ids sent to the server.')
        }

        if (table && primaryKey) {
            this.repository = new Repository(table, primaryKey)
        }

        try {
            const result = await this.repository.find(ids)
            return res.send(result)
        } catch (error) {
            next(error)
        }
    }

    async getOne(req, res, next) {
        try {
            const { table, key, value } = req.query
            const condition = `WHERE ${key} = ${value}`
            const el = await getUpdatedData(table, condition)
            return res.json(el)

        } catch (error) {
            next(error)
        }
    }

    async checkIfExists(req, res, next) {
        const { table, column, value } = req.query;

        if (!table || !column || !value) {
            return res.status(400).send('Bad request, missing some params...')
        }

        const query = `SELECT * FROM ${table} WHERE ${column} = '${value}'`;
        const exists = await pool.query(query).catch(e => next(e))
        const doesExist = exists.rows && exists.rows[0]

        if (doesExist) {
            return res.send(true)
        }
        res.send(false)
    }

    async save(req, res, next) {
        const { user } = req
        if (user.role !== 'admin')
            return res.status(403).send('É preciso permissão de administrador para acessar essa parte do cadTI.')

        try {
            const id = await this.repository.save(req.body)
            res.status(201).json(id)

            const createdEntity = await this.repository.find(id)
            const { codigo_empresa } = createdEntity[0]
            const socket = new CustomSocket(req)

            socket.emit('insertElements', createdEntity, this.table, this.primaryKey, codigo_empresa)
        } catch (error) {
            next(error)
        }

    }

    /**
     * @param {request} req
     * @param {response} res
     * @returns {Promise<any>}
     */
    update = async (req, res, next) => {
        const { codigo_empresa } = req.body

        if (Object.keys(req.body).length <= 1) {
            return res.status(400).send('Nothing to update...')
        }

        try {
            const repository = new Repository(this.table, this.primaryKey)
            const result = await repository.update(req.body)
            if (!result) {
                return res.status(404).send('Não foi encontrado nenhum registro na base de dados para atualização.')
            }

            let filter = req.body[this.primaryKey]

            if (Array.isArray(req.body)) {
                filter = req.body.map(el => el[this.primaryKey])
            }

            const updates = await repository.find(filter)
            const socket = new CustomSocket(req)
            socket.emit('updateAny', updates, this.table, this.primaryKey, codigo_empresa)

            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    delete = async (req, res, next) => {

        const { user } = req
        const { table, tablePK, codigoEmpresa } = req.query
        //@ts-ignore
        const { collection } = fieldParser.find(f => f.table === table)
        let { id } = req.query

        if (user.role !== 'admin' && collection !== 'procuracoes') {
            return res.status(403).send('É preciso permissão de administrador para acessar essa parte do cadTI.')
        }
        if (!id) {
            return res.status(400).send('No id provided.')
        }

        this.repository = new Repository(table, tablePK)
        const result = await this.repository.delete(id)
            .catch(err => next(err))

        if (result) {
            const singleSocket = req.headers.referer && req.headers.referer.match('/veiculos/config')
            if (singleSocket) {
                const io = req.app.get('io')
                io.sockets.emit('deleteOne', { id, tablePK, collection })
            }
            else {
                id = id.replace(/\'/g, '')
                deleteSockets({ req, noResponse: true, table, tablePK, event: 'deleteOne', id, codigoEmpresa })
                const { cpf_socio, cpf_procurador } = req.query

                if (table === 'socios' || table === 'procuradores')
                    removeEmpresa({ representantes: [{ cpf_socio, cpf_procurador }], codigoEmpresa })
            }
            return res.send(`${id} deleted from ${table}`)
        }
        return res.status(404).send('Not found')
    }

    //FIX and REFACTOR - userFilter???
    emitSocket = async ({ io, ids, event }) => {

        let condition = ''
        ids.forEach(id => condition += `${this.primaryKey} = '${id}' OR `)
        condition = 'WHERE ' + condition
        condition = condition.slice(0, condition.length - 3)

        const data = await getUpdatedData(this.table, condition)
        console.log("🚀 ~ file: Controller.js:296 ~ Controller ~ emitSocket= ~ data", data)

        /*  io.sockets.emit(
             event || this.socketEvent,
             {
                 collection: this.table,
                 primaryKey: this.primaryKey,
                 updatedObjects: data
             }
         ) */
    }

    addElement = (req, res, next) => {
        const io = req.app.get('io')
        const { user } = req
        const { table, requestElement } = req.body
        //@ts-ignore
        const { keys, values } = parseRequestBody(requestElement)

        if (user.role !== 'admin')
            return res.status(403).send('É preciso permissão de administrador para acessar essa parte do cadTI.')
        console.log("🚀 ~ file: server.js ~ line 550 ~ app.post ~ user.role", user.role)

        let queryString = `INSERT INTO public.${table} (${keys}) VALUES (${values}) RETURNING *`
        console.log("🚀 ~ file: server.js ~ line 561 ~ app.post ~ queryString", queryString)

        pool.query(queryString, async (err, t) => {
            if (err) console.log(err)

            if (t && t.rows) {
                if (table !== 'laudos')
                    io.sockets.emit('addElements', { insertedObjects: t.rows, table })
                //Se a tabela for laudos
                else {
                    //Emite sockets para atualização dos laudos
                    const
                        { veiculo_id, codigo_empresa } = requestElement,
                        condition = `WHERE laudos.codigo_empresa = ${codigo_empresa}`
                    //@ts-ignore
                    userSockets({ req, noResponse: true, table, condition, event: 'updateElements' })

                    //Atualiza status do veículo e emite sockets para atualização dos laudos
                    if (veiculo_id) {
                        req.body.codigoEmpresa = codigo_empresa     //Passa o codigo p o body para o userSockets acessar
                        await updateVehicleStatus([veiculo_id])
                        const vCondition = `WHERE veiculos.veiculo_id = ${veiculo_id}`
                        //@ts-ignore
                        userSockets({ req, noResponse: true, table: 'veiculos', event: 'updateVehicle', condition: vCondition })
                    }
                    return res.send(t.rows)
                }
                res.send('Dados inseridos')
            }
        })
    }
}

module.exports = { Controller }