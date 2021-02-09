const
    { pool } = require("../config/pgConfig"),
    { getUpdatedData } = require("../getUpdatedData")

const userSockets = async ({ req, res, table, condition = '', event, collection, mongoData, veiculo_id, id }) => {
    //Os args table e condition se referem ao banco postgresql
    //Os args collection e data ao MongoDB
    const
        io = req.app.get('io'),
        { sockets } = io.sockets,
        ids = Object.keys(sockets)

    let
        data,
        { codigoEmpresa, codigo_empresa } = req.body

    if (!codigoEmpresa)             //Se vier do Postgres, virá decamelized
        codigoEmpresa = codigo_empresa

    console.log("🚀 ~ file: userSockets.js ~ line 17 ~ userSockets ~ codigoEmpresa", codigoEmpresa)
    if (table === 'seguros') {
        try {
            const getData = await pool.query(`SELECT * FROM seguros WHERE id = ${id}`)
            data = getData && getData.rows
        }
        catch (err) {
            console.log(err)
        }
    }

    else if (table)
        data = await getUpdatedData(table, condition)
    if (collection && mongoData)
        data = mongoData

    console.log("🚀 ~ file: userSockets.js ~ line 28 ~ userSockets ~ data", data)


    let filteredData = []
    //Ao conectar o socket em server.js, usuários com permissão 'empresa' q têm mais de uma empresa tem uma array 'empresas' inserida
    ids.forEach(id => {
        const
            socket = sockets[id],
            { empresas } = socket
        //console.log(socket.rooms)
        //Se tem a prop empresa filtra os dados apenas com essas empresas e emite um evento para cada usuário, conforme suas permissões
        if (empresas) {
            filteredData = filterData(table, data, empresas, event, collection)
            //console.log("🚀 ~ file: userSockets.js ~ line 29 ~ userSockets ~ filteredData", filteredData)
            if (filteredData[0])
                io.sockets.to(id).emit(event, filteredData)
            else if (filteredData instanceof Object && Object.keys(filteredData).length > 0)
                io.sockets.to(id).emit(event, filteredData)
        }
    })

    //No server.js, usuários de só uma empresa fazem join() no socket com aquela empresa
    //Se o usuário tem perm. empresa e só possui uma, a data a ser filtrada é apenas aquela empresa, e basta enviar para aquela sala específica
    filteredData = filterData(table, data, [codigoEmpresa], event, collection)
    io.sockets.to(codigoEmpresa).emit(event, filteredData)

    //Os usuários admin fazem join('admin') no server. Basta enviar todos os dados sem filtro para a room 'admin'
    //console.log(data.length)
    data = formatData(data, event, collection)
    await io.sockets.to('admin').emit(event, data)

    if (veiculo_id)
        return res.send('' + veiculo_id)
    res.send('Dados atualizados.')
}

//Trata as tabelas do Postgresql que não possuem a coluna codigo_empresa
const filterData = (table, data, codigosEmpresa, event, collection) => {

    let result = []
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
        else {
            if (table)
                temp = data.filter(d => d.codigo_empresa === codigoEmpresa)
            //Se for collection do mongo o id para filtrar é empresaID
            else if (collection)
                temp = data.filter(d => d.empresaId === codigoEmpresa)
        }
        result.push(...temp)
        temp = []
    })
    if (collection)
        result = formatData(result, event, collection)
    console.log("🚀 ~ file: userSockets.js ~ line 77 ~ filterData ~ result", result)
    return result
}

//Formata os dados do jeito que o client espera receber
const formatData = (data, event, collection) => {
    let formatedData

    if (event === 'insertElements')
        formatedData = { insertedObjects: data, collection }
    else
        formatedData = data

    return formatedData
}

module.exports = userSockets

