//@ts-check
const { request, response } = require("express");
const { Socio } = require("../domain/Socio");
const { EntityDaoImpl } = require("../infrastructure/EntityDaoImpl");
const { Repository } = require("../repositories/Repository");
const { Controller } = require("./Controller");

class SocioController extends Controller {

    table = 'socios'
    primaryKey = 'socio_id'
    event = 'insertSocios'


    constructor(table, primaryKey) {
        super()
        if (!this.table)
            table = table
        if (!this.primaryKey)
            this.primaryKey = primaryKey

        this.repository = new Repository(this.table, this.primaryKey)
    }

    /**      
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<any>}
     */
    async saveMany(req, res) {

        const
            { codigo_empresa: codigoEmpresa, ...socios } = req.body
            , updatedSocios = new Socio().addEmpresaAndShareArray(codigoEmpresa, socios)
            , socioDaoImpl = new EntityDaoImpl(this.table, this.primaryKey)
            , ids = await socioDaoImpl.saveMany(updatedSocios)

        res.send(ids)
    }
}

module.exports = { SocioController }