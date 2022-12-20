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
    emit(event, data, table, primaryKey, codigoEmpresa) {

        const formattedData = {
            data,
            collection: table || this.table,
            primaryKey: primaryKey || 'id'
        }
        console.log("🚀 ~ file: CustomSocket.js:36 ~ CustomSocket ~ emit ~ formattedData", formattedData)

        this.io.sockets
            .to('admin')
            .to('tecnico')
            .emit(event, formattedData)

        const authorizedUsers = this.getSocketRecipients(codigoEmpresa)
        for (let user of authorizedUsers) {
            this.io.sockets
                .to(user)
                .emit(event, formattedData)
        }
    }

    /**
     * @param {string|number|undefined} codigoEmpresa
     */
    getSocketRecipients(codigoEmpresa) {
        const { sockets } = this.io.sockets
        const socketIds = Object.keys(sockets)
        const authorizedSockets = socketIds.filter(id => sockets[id].empresas && sockets[id].empresas.includes(codigoEmpresa))

        return authorizedSockets
    }
}

module.exports = { CustomSocket }
