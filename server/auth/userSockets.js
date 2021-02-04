const { getUpdatedData } = require("../getUpdatedData")

const userSockets = async (req, res, table, event) => {

    const
        io = req.app.get('io'),
        { codigoEmpresa } = req.body,
        { sockets } = io.sockets,
        ids = Object.keys(sockets),
        data = await getUpdatedData(table)
    console.log(table, codigoEmpresa)
    let filteredData = []
    //Ao conectar o socket em server.js, usuários com permissão 'empresa' q têm mais de uma empresa tem uma array 'empresas' inserida
    ids.forEach(id => {
        const
            socket = sockets[id],
            { empresas } = socket
        console.log(socket.rooms)
        //Se tem a prop empresa filtra os dados apenas com essas empresas e emite um evento para cada usuário, conforme suas permissões
        if (empresas) {
            filteredData = parseEmpresa(table, data, empresas)
            //console.log("🚀 ~ file: userSockets.js ~ line 29 ~ userSockets ~ filteredData", filteredData)
            io.sockets.to(id).emit(event, filteredData)
        }
    })

    //No server.js, usuários de só uma empresa fazem join() no socket com aquela empresa
    //Se o usuário tem perm. empresa e só possui uma, a data a ser filtrada é apenas aquela empresa, e basta enviar para aquela sala específica

    filteredData = parseEmpresa(table, data, [codigoEmpresa])

    io.sockets.to(codigoEmpresa).emit('a', filteredData)

    //Os usuários admin fazem join('admin') no server. Basta enviar todos os dados sem filtro para a room 'admin'
    console.log(data.length)
    io.sockets.to('admin').emit('a', data)

    //    res.send('Dados atualizados.')
}

//Trata as tabelas do Postgresql que não possuem a coluna codigo_empresa
const parseEmpresa = (table, data, codigosEmpresa) => {

    const result = []
    codigosEmpresa.forEach(codigoEmpresa => {
        let temp = []
        if (table === 'procuradores')
            temp = data.filter(p => {
                //console.log(p.empresas && p.empresas.includes(codigoEmpresa))
                //console.log(p.empresas, codigoEmpresa)
                return p.empresas && p.empresas.includes(codigoEmpresa)
            })
        else if (table === 'socios')
            temp = data.filter(s => s.empresas && s.empresas.match(codigoEmpresa.toString()))
        else
            temp = data.filter(d => d.codigo_empresa === codigoEmpresa)
        result.push(...temp)
        temp = []
    })
    return result
}

module.exports = userSockets