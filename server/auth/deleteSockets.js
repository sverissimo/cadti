//O deleteOne é o evento de socket que espera receber table, tablePK e id. 
const deleteSockets = async ({ req, noResponse, table, tablePK, id, event, codigoEmpresa }) => {
    const
        io = req.app.get('io'),
        { sockets } = io.sockets,
        ids = Object.keys(sockets),
        data = { id, tablePK, collection: table }

    console.log("🚀 ~ file: deleteSockets.js ~ line 13 ~ deleteSockets ~ codigoEmpresa", codigoEmpresa)
    //Ao conectar o socket em server.js, usuários com permissão 'empresa' cada usuário tem uma array 'empresas' inserida
    ids.forEach(id => {
        const
            socket = sockets[id],
            { empresas } = socket
        //Se tem a prop empresa filtra os dados apenas com essas empresas e emite um evento para cada usuário, conforme suas permissões
        if (empresas) {
            //console.log(typeof empresas[0], typeof codigoEmpresa)
            const confirmSend = empresas.some(e => e == codigoEmpresa)
            console.log("🚀 ~ file: deleteSockets.js ~ line 19 ~ deleteSockets ~ data", data)
            if (confirmSend) {
                console.log("🚀 ~ file: deleteSockets.js ~ line 21 ~ deleteSockets ~ data", data)
                io.sockets.to(id).emit(event, data)
            }
        }
    })
    //Os usuários admin fazem join('admin') no server. Basta enviar todos os dados sem filtro para a room 'admin'        
    await io.sockets.to('admin').emit(event, data)

    if (noResponse)
        return
    else
        return res.send('Dados atualizados.')
}
module.exports = deleteSockets
