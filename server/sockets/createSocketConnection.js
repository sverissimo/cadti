//@ts-check
const socketIO = require('socket.io')

const createSocketConnection = (app, server) => {
    const io = server && socketIO.listen(server)
    io.on('connection', socket => {
        socket.on('userDetails', user => {
            if (user.role !== 'empresa') {
                socket.join('admin')
                console.log('admin socket connected')
            }
            else if (user.empresas) {
                const { empresas } = user
                console.log('User socket connected. Empresas: ', empresas)
                socket.empresas = empresas
            }
            if (user.role === 'backupService' && user.token === process.env.BACKUP_TOKEN) {
                console.log("### Backup service connected.")
                socket.join('backupService')
            }
        })
    })
    return io
}

module.exports = { createSocketConnection }
