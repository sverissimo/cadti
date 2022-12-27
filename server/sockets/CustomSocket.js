//@ts-check

class CustomSocket {
    /** @property {Array<string | number>} ids - Array de ids dos webSockets dos usuários conectados via wss.         */
    ids;

    /** @property {any} io */
    io;

    /**
     * @param {any} io
     * @param {string} table
     */
    constructor(io, table) {
        this.io = io
        this.ids = Object.keys(this.io.sockets.sockets)
        this.table = table
    }

    /**
    * @param {'insertElements'|'addElements'|'updateAny'|'deleteOne'} event
    * @param {Object | any[]} data
    * @param {string} [primaryKey]
    * @param {number | string} [codigoEmpresa ]
     */
    emit(event, data, codigoEmpresa, primaryKey = 'id') {
        const formattedData = {
            data,
            primaryKey,
            collection: this.table,
        }

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
     * @param {string|number} id
     * @param {string} primaryKey
     * @param {number} codigoEmpresa
     */
    delete(id, primaryKey = 'id', codigoEmpresa) {
        const data = {
            id,
            tablePK: primaryKey,
            collection: this.table,
        }

        const authorizedUsers = this.getSocketRecipients(codigoEmpresa)
        this.emitSockets({
            data,
            event: 'deleteOne',
            recipients: authorizedUsers,
        })
    }


    /** @param {string|number|undefined} codigoEmpresa */
    getSocketRecipients(codigoEmpresa) {
        const { sockets } = this.io.sockets
        const socketIds = Object.keys(sockets)
        const authorizedSockets = socketIds.filter(id => sockets[id].empresas
            && sockets[id].empresas.includes(codigoEmpresa))

        return authorizedSockets
    }

    emitSockets({ event, recipients, data }) {
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
