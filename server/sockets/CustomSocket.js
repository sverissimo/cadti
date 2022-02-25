//@ts-check
const { request } = require("express");

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
     * @param {request} req     
     */
    constructor(req) {
        this.io = req.app.get('io')
        this.ids = Object.keys(this.io.sockets.sockets)
        this.table = req.url.replace('/', '')
    }

    /**      
    * @param {string} event 
    * @param {Object | any[]} data
    * @param {string} [table]
    * @param {string} [primaryKey] 
    * @param {number | string} [codigoEmpresa ]     
     */
    async emit(event, data, table, primaryKey, codigoEmpresa) {

        const formattedData = {
            data,
            collection: table || this.table,
            primaryKey
        }

        this.io.sockets
            .to('admin')
            .to('tecnico')
            .emit(event, formattedData)
    }
}

module.exports = { CustomSocket }
