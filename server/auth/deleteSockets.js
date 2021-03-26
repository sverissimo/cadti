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
        if (empresas && codigoEmpresa) {
            //console.log(typeof empresas[0], typeof codigoEmpresa)
            let confirmSend = empresas.some(e => e == codigoEmpresa)
            //Se a tabela for socios ou procuradores, o codigoEmpresa é uma array de empresas em string do req.query
            if (table === 'procuradores')
                confirmSend = empresas.some(e => JSON.parse(codigoEmpresa).includes(e))
            if (table === 'socios')
                confirmSend = empresas.some(cod => JSON.parse(codigoEmpresa).find(e => e.codigoEmpresa == cod))
            /* 
                        console.log("🚀 ~ file: deleteSockets.js ~ line 25 ~ deleteSockets ~ confirmSend", confirmSend)
                        console.log("🚀 ~ file: deleteSockets.js ~ line 26 ~ deleteSockets ~ JSON.parse(codigoEmpresa)", JSON.parse(codigoEmpresa))
                        console.log("🚀 ~ file: deleteSockets.js ~ line 27 ~ deleteSockets ~ data", data) */
            if (confirmSend) {
                //console.log("🚀 ~ file: deleteSockets.js ~ line 21 ~ deleteSockets ~ data", data)
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
