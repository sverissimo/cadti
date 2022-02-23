//@ts-check
const { request } = require("express");
const { Repository } = require("../repositories/Repository");

/**
 * @class CustomSocket
 */
class CustomSocket {

    /**
     * @property {Array<string | number>} ids - Array de ids dos webSockets dos usuários conectados via wss.         */
    ids;

    /**
     * @property {any} io */
    io;

    /**
     * @property {} codigo_empresa @type {number | string} */
    codigoEmpresa;

    /**
     * @param {request} req
     * @param {string} [table]
     */
    constructor(req, table) {
        this.io = req.app.get('io')
        this.ids = Object.keys(this.io.sockets.sockets)
        this.codigoEmpresa = req.body.codigoEmpresa || req.body.codigo_empresa
        this.table = table || req.url.replace('/', '')
    }

    /**      
     * @param {string} event 
     * @param {Object | any[]} data
     * @param {number | string} [codigoEmpresa ]     
     */
    async emit(event, data, codigoEmpresa = this.codigoEmpresa) {
        const formattedData = { insertedObjects: data, collection: this.table }
        this.io.sockets.to('admin').to('tecnico').emit(event, formattedData)
    }
}

module.exports = { CustomSocket }
