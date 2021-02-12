const { getUpdatedData } = require("../getUpdatedData")

//Condition é a string de filtro de busca para o postgres, noResponse é para não enviar res.send(pq a função é chamada no meio de outra)
const userSockets = async ({ req, res, table, condition = '', event, collection, mongoData, veiculo_id, noResponse }) => {
    //Os args table e condition se referem ao banco postgresql
    //Os args collection e data ao MongoDB
    const
        io = req.app.get('io'),
        { sockets } = io.sockets,
        ids = Object.keys(sockets)

    let
        data,
        { codigoEmpresa, codigo_empresa } = req.body
    //console.log("🚀 ~ file: userSockets.js ~ line 15 ~ userSockets ~ codigoEmpresa", codigoEmpresa)

    if (!codigoEmpresa)             //Se vier do Postgres, virá decamelized
        codigoEmpresa = codigo_empresa

    console.log("🚀 ~ file: userSockets.js ~ line 20 ~ userSockets ~ codigoEmpresa", codigoEmpresa)

    if (table)
        data = await getUpdatedData(table, condition)
    if (collection && mongoData)
        data = mongoData

    let filteredData = []
    //Ao conectar o socket em server.js, usuários com permissão 'empresa' cada usuário tem uma array 'empresas' inserida
    ids.forEach(id => {
        const
            socket = sockets[id],
            { empresas } = socket
        //Se tem a prop empresa filtra os dados apenas com essas empresas e emite um evento para cada usuário, conforme suas permissões
        if (empresas) {
            filteredData = filterData(table, data, empresas, event, collection)
            //console.log("🚀 ~ file: userSockets.js ~ line 37 ~ userSockets ~ filteredData", filteredData)
            if (filteredData[0])
                io.sockets.to(id).emit(event, filteredData)
            else if (filteredData instanceof Object && Object.keys(filteredData).length > 0)
                io.sockets.to(id).emit(event, filteredData)
        }
    })
    //Os usuários admin fazem join('admin') no server. Basta enviar todos os dados sem filtro para a room 'admin'    
    data = formatData({ data, event, collection, table })
    await io.sockets.to('admin').emit(event, data)

    console.log("🚀 ~ file: userSockets.js ~ line 57 ~ userSockets ~ data", data)

    if (noResponse)
        return
    if (veiculo_id)
        return res.send('' + veiculo_id)
    if (table === 'procuradores' || table === 'socios')
        return res.send(data)
    else
        return res.send('Dados atualizados.')
}

//Trata as tabelas do Postgresql que não possuem a coluna codigo_empresa
const filterData = (table, data, codigosEmpresa, event, collection) => {

    let result = []
    //Para cada código de empresa q o usuário tem, verifica se o codigoEmpresa do req bate
    codigosEmpresa.forEach(codigoEmpresa => {
        let temp = []

        if (table === 'procuradores')
            temp = data.filter(p => p.empresas && p.empresas.includes(codigoEmpresa))
        else if (table === 'socios') {
            temp = data.filter(s => s.empresas && s.empresas.match(codigoEmpresa.toString()))
            console.log("🚀 ~ file: userSockets.js ~ line 71 ~ filterData ~ data", data, typeof data[0].empresas)
        }

        else {
            if (table)
                temp = data.filter(d => d.codigo_empresa === codigoEmpresa)
            //Se for collection do mongo o id para filtrar é empresaID
            else if (collection)
                temp = data.filter(d => d.empresaId === codigoEmpresa)
        }
        //console.log("🚀 ~ file: userSockets.js ~ line 84 ~ filterData ~ temp", temp)
        result.push(...temp)
        temp = []
    })
    //Se achou o codigoEmpresa na array de empresas do usuário, formata a data para enviar o socket
    if (result[0])
        result = formatData({ data: result, event, collection, table })
    //console.log("🚀 ~ file: userSockets.js ~ line 77 ~ filterData ~ result", result)
    return result
}

//Formata os dados do jeito que o client espera receber
const formatData = ({ data, event, collection, table }) => {
    let formatedData

    if (event === 'insertElements')
        formatedData = { insertedObjects: data, collection: collection || table }
    else if (event === 'updateElements' && table === 'laudos')
        formatedData = { updatedCollection: data, collection: table }
    else
        formatedData = data

    return formatedData
}

module.exports = userSockets
