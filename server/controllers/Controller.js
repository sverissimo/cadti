//@ts-check
const { request, response } = require("express")
const { Repository } = require("../repositories/Repository")
const { fieldParser } = require("../utils/fieldParser")
const { CustomSocket } = require("../sockets/CustomSocket")

/**Classe parent de controlador para os requests de acesso ao banco de dados Postgresql.
 * @class
 */
class Controller {
    /**
     * @property {} table - nome da tabela no DB vinculada à entidade
     * @type {string}     */
    table;

    /**
     * @property {} primaryKey - nome da coluna referente ao ID da tabela
     * @type {string}     */
    primaryKey;

    /**
     * @property {} repository
     * @type {Repository}     */
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
    }

    /**
     * @param {request} req
     * @param {response} res
     * @returns {Promise<any>}
     */
    list = async (req, res, next) => {
        // filtro de permissões de usuário fornecido pelo middleware getRequestFilter.js
        const { userSQLFilter } = res.locals

        if (req.params.id || Object.keys(req.query).length) {
            return this.find(req, res, next)
        }
        try {
            const collection = await this.repository.list(userSQLFilter)
            res.status(200).json(collection)
        } catch (e) {
            console.log(e.name + ': ' + e.message)
            next(e)
        }
    }

    find = async (req, res, next) => {
        const { noGetFilterRequired, empresasAllowed } = res.locals
        let queryFilter = req.params.id || req.query || res.locals.paramsID

        if (req.params.id && queryFilter.match(',')) {
            queryFilter = queryFilter.split(',')
        }

        if (req.query && Object.keys(req.query).length) {
            const searchKey = Object.keys(req.query)[0]
            queryFilter = {
                [searchKey]: req.query[searchKey].split(',')
            }
        }

        try {
            const entities = await this.repository.find(queryFilter)
            if (noGetFilterRequired) {
                return res.json(entities)
            }

            const filteredEntities = entities.filter(el => {
                if (empresasAllowed.includes(el.codigo_empresa)) {
                    return true
                }
                else if (Array.isArray(el.empresas)) {
                    return empresasAllowed.some(allowed => el.empresas.includes(allowed))
                }
            })
            filteredEntities.length ?
                res.json(filteredEntities)
                :
                res.status(404).send('Registro não encontrado.')
        } catch (error) {
            next(error)
        }
    }

    checkIfExists = async (req, res) => {
        const { table, column, value } = req.query
        if (!table || !column || !value) {
            return res.status(400).send('Bad request, missing some params...')
        }

        const itemExists = await new Repository(table, column).checkIfExists({ column, value })
        if (itemExists) {
            return res.send(true)
        }
        res.send(false)
    }

    save = async (req, res, next) => {
        const { user } = req
        if (user.role !== 'admin') {
            return res.status(403).send('É preciso permissão de administrador para acessar essa parte do cadTI.')
        }

        try {
            const id = await this.repository.save(req.body)
            const io = req.app.get('io')
            const socket = new CustomSocket(io, this.table, this.primaryKey)
            const createdEntity = await this.repository.find(id)
            const { codigo_empresa } = createdEntity[0]

            socket.emit('insertElements', createdEntity, codigo_empresa)
            res.status(201).json(id)
        } catch (error) {
            next(error)
        }
    }

    update = async (req, res, next) => {
        const { codigo_empresa } = req.body

        if (Object.keys(req.body).length <= 1) {
            return res.status(400).send('Nothing to update...')
        }

        try {
            const result = await this.repository.update(req.body)
            if (!result) {
                return res.status(404).send('Não foi encontrado nenhum registro na base de dados para atualização.')
            }

            let filter = req.body[this.primaryKey]

            if (Array.isArray(req.body)) {
                filter = req.body.map(el => el[this.primaryKey])
            }

            const io = req.app.get('io')
            const socket = new CustomSocket(io, this.table, this.primaryKey)
            const updates = await this.repository.find(filter)

            socket.emit('updateAny', updates, codigo_empresa)
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    updateMany = async (req, res, next) => {
        const { codigoEmpresa, ...entities } = req.body
        const updates = entities[this.table]
        if (!updates || !updates.length) {
            return res.status(400).send('Nothing to update...')
        }

        try {
            const result = await this.repository.updateMany(updates)
            if (!result) {
                return res.status(404).send('Resource not found.')
            }

            const io = req.app.get('io')
            const socket = new CustomSocket(io, this.table, this.primaryKey)
            const ids = updates.map(u => u[this.primaryKey])

            const updatedData = await this.repository.find(ids)
            console.log("🚀 ~ file: Controller.js:178 ~ Controller ~ updateMany= ~ updatedData", updatedData)
            socket.emit('updateAny', updatedData, codigoEmpresa)
            return res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    delete = async (req, res, next) => {
        const { user } = req
        const { table, tablePK, id, codigoEmpresa } = req.query

        if (user.role !== 'admin') {
            return res.status(403).send('É preciso permissão de administrador para acessar essa parte do cadTI.')
        }
        if (!id || !table) {
            return res.status(400).send('Bad request: ID or table missing.')
        }

        this.repository = new Repository(table, tablePK)
        const result = await this.repository.delete(id)
            .catch(err => next(err))

        if (!result) {
            return res.status(404).send('Not found')
        }

        const io = req.app.get('io')
        //@ts-ignore
        const { collection } = fieldParser.find(f => f.table === table)
        const socket = new CustomSocket(io, collection, tablePK)
        socket.delete(id, codigoEmpresa)
        return res.send(`${id} deleted from ${table}`)
    }

    addElement = async (req, res, next) => {
        const { table, requestElement } = req.body
        //@ts-ignore
        const { collection } = fieldParser.find(f => f.table === table)
        const repository = await new Repository(table, 'id')
        const createdId = await repository.save(requestElement)
            .catch(err => next(err))

        const savedElement = await repository.find(createdId)
        const io = req.app.get('io')

        const socket = new CustomSocket(io, collection, 'id')
        socket.emit('insertElements', savedElement)
        return res.status(201).end()
    }
}

module.exports = { Controller }
