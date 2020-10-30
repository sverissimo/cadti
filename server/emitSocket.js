const { getUpdatedData } = require("./getUpdatedData")

const emitSocket = ({ io, socketEvent, table, primaryKey, condition }) => {
    const
        collection = table,
        data = getUpdatedData(table, condition)

    if (data)
        data.then(res => {
            io.sockets.emit(socketEvent, { collection, primaryKey, updatedObjects: res })
            return
        })
}

module.exports = emitSocket