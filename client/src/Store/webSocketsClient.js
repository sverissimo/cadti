import { configVehicleForm } from '../Forms/configVehicleForm'
import { getEnvironment } from '../getEnvironment'
const socketIO = require('socket.io-client')
const { webSocketHost, options } = getEnvironment()


const startSocket = ({ insertData, updateData, updateCollection, deleteOne, updateDocs, user, editUser }) => {
    let socket

    if (!socket)
        socket = socketIO({ url: webSocketHost, options })

    //Conecta o usuário em um socket, passando suas informações
    socket.on('connect', () => socket.emit('userDetails', user))

    //********************Listen to socket events and call dataActions*********************** */
    socket.on('insertVehicle', insertedObjects => insertData(insertedObjects, 'veiculos'))
    socket.on('insertInsurance', insertedObjects => insertData(insertedObjects, 'seguros'))
    socket.on('insertProcuradores', insertedObjects => insertData(insertedObjects, 'procuradores'))
    socket.on('insertElements', ({ data, collection }) => insertData(data, collection))

    socket.on('addElements', ({ insertedObjects, table }) => {
        const { collection } = configVehicleForm.find(el => el.table === table)
        insertData(insertedObjects, collection)
    })

    socket.on('updateVehicle', updatedObjects => updateData(updatedObjects, 'veiculos', 'veiculoId'))
    socket.on('updateInsurance', updatedObjects => updateCollection(updatedObjects, 'seguros'))
    socket.on('updateProcuradores', ({ collection, data, primaryKey }) => updateData(data, collection, primaryKey))
    socket.on('updateLogs', updatedObjects => updateData(updatedObjects, 'logs', 'id'))
    socket.on('updateAny', ({ data, collection, primaryKey }) => updateData(data, collection, primaryKey))
    socket.on('updateDocs', ({ ids, metadata, collection, primaryKey }) => updateDocs(ids, metadata, collection, primaryKey))
    socket.on('updateElements', ({ collection, updatedCollection }) => updateCollection(updatedCollection, collection))
    socket.on('updateUser', updatedUser => editUser(updatedUser))

    socket.on('deleteOne', ({ id, tablePK, collection }) => {
        console.log({ id, tablePK, collection })
        deleteOne(id, tablePK, collection)
    })

    socket.on('insertFiles', object => {
        const { insertedObjects, collection } = object
        insertData(insertedObjects, collection)
    })

    return socket
}


export default startSocket
