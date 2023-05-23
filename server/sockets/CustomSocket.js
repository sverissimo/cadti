//@ts-check
const { freeAccessTables } = require("../auth/freeAccessTables");

class CustomSocket {
    /** @property {Array<string | number>} ids - Array de ids dos webSockets dos usuários conectados via wss.         */
    ids;

    /** @property {any} io */
    io;

    /**
     * @param {any} io
     * @param {string} table
     * @param {string} [primaryKey]
     */
    constructor(io, table, primaryKey = 'id') {
        this.io = io
        this.ids = Object.keys(this.io.sockets.sockets)
        this.table = table
        this.primaryKey = primaryKey
    }

    /**
    * @param {'insertElements'|'addElements'|'updateAny'|'insertFiles'|'updateDocs'} event
    * @param {Object | any[]} data
    * @param {number | string} [codigoEmpresa ]
     */
    emit(event, data, codigoEmpresa) {
        const formattedData = {
            data,
            primaryKey: this.primaryKey,
            collection: this.table,
        }

        if (!this._shouldFilterRecipients()) {
            this.io.sockets.emit(event, formattedData)
            return
        }

        const authorizedUsers = this._getSocketRecipients(codigoEmpresa)
        this._filterAndEmitSockets({
            event,
            data: formattedData,
            recipients: authorizedUsers,
        })
    }

    /**
     * @param {string|number} id
     * @param {number} codigoEmpresa
     */
    delete(id, codigoEmpresa) {
        const data = {
            id,
            tablePK: this.primaryKey,
            collection: this.table,
        }

        if (!this._shouldFilterRecipients()) {
            this.io.sockets.emit('deleteOne', data)
            return
        }

        const authorizedUsers = codigoEmpresa ? this._getSocketRecipients(codigoEmpresa) : []
        this._filterAndEmitSockets({
            data,
            event: 'deleteOne',
            recipients: authorizedUsers,
        })
    }

    _shouldFilterRecipients() {
        if (freeAccessTables.includes(this.table)) {
            return false
        }
        return true
    }

    /** @param {string|number|undefined} codigoEmpresa */
    _getSocketRecipients(codigoEmpresa) {
        const { sockets } = this.io.sockets
        const socketIds = Object.keys(sockets)
        const authorizedSockets = socketIds.filter(id => sockets[id].empresas
            && sockets[id].empresas.includes(codigoEmpresa))

        return authorizedSockets
    }

    _filterAndEmitSockets({ event, recipients, data }) {
        this.io.sockets
            .to('admin')
            .to('tecnico')
            .emit(event, data)

        for (let user of recipients) {
            this.io.sockets
                .to(user)
                .emit(event, data)
        }
    }
}

module.exports = { CustomSocket }
