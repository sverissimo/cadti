//@ts-check
const socketIO = require('socket.io')

const createSocketConnection = (app, server) => {
    const io = server && socketIO.listen(server)
    io.on('connection', socket => {
        if (socket.handshake.headers.authorization === process.env.FILE_SECRET) {
            app.set('backupSocket', socket)
            console.log('new backup socket connected.')
        }
        socket.on('userDetails', user => {
            if (user.role !== 'empresa') {
                socket.join('admin')
                console.log('admin')
            }
            else if (user.empresas) {
                const { empresas } = user
                console.log('Array de empresas: ', empresas)
                socket.empresas = empresas
            }
        })
    })
    return io
}

module.exports = { createSocketConnection }
