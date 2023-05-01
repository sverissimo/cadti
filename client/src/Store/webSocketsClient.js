import { configVehicleForm } from '../Forms/configVehicleForm'
import { getEnvironment } from '../getEnvironment'
const socketIO = require('socket.io-client')
const { webSocketHost, options } = getEnvironment()


const startSocket = ({ insertData, updateData, deleteOne, updateDocs, user, editUser }) => {
    let socket
    if (!socket) {
        socket = socketIO({ url: webSocketHost, options })
    }

    socket.on('connect', () => socket.emit('userDetails', user))

    socket.on('insertElements', ({ data, collection }) => insertData(data, collection))
    socket.on('addElements', ({ insertedObjects, table }) => {
        const { collection } = configVehicleForm.find(el => el.table === table)
        insertData(insertedObjects, collection)
    })
    socket.on('updateAny', ({ data, collection, primaryKey }) => updateData(data, collection, primaryKey))
    socket.on('updateDocs', ({ data, collection, primaryKey }) => updateDocs(data, collection, primaryKey))
    socket.on('updateUser', updatedUser => editUser(updatedUser))
    socket.on('deleteOne', ({ id, tablePK, collection }) => {
        console.log({ id, tablePK, collection })
        deleteOne(id, tablePK, collection)
    })
    socket.on('insertFiles', ({ data, collection }) => { insertData(data, collection) })

    return socket
}


export default startSocket
