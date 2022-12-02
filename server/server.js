//Node modules
const
    fs = require('fs'),
    express = require('express'),

    httpsOptions = {
        key: fs.readFileSync("/sismob/certificates/localhost.key"),
        cert: fs.readFileSync("/sismob/certificates/localhost.crt"),
    },
    app = express(),
    productionServer = require('https').createServer(httpsOptions, app),
    devServer = require('http').createServer(app),

    path = require('path'),
    dotenv = require('dotenv'),
    mongoose = require('mongoose'),
    { conn } = require('./mongo/mongoConfig'),
    morgan = require('morgan'),
    xlsx = require('xlsx'),
    Grid = require('gridfs-stream')
Grid.mongo = mongoose.mongo

//Componentes do sistema
const
    counter = require('./config/counter'),
    { pool } = require('./config/pgConfig'),
    { setCorsHeader } = require('./config/setCorsHeader'),
    router = require('./routes/routes'),
    { storage, uploadMetadata } = require('./mongo/mongoUpload'),
    { mongoDownload, getFilesMetadata, getOneFileMetadata } = require('./mongo/mongoDownload'),
    { cadProcuradores } = require('./cadProcuradores'),
    { seguros } = require('./queries'),
    { getUpdatedData } = require('./getUpdatedData'),
    { empresaChunks, vehicleChunks } = require('./mongo/models/chunksModel'),
    { parseRequestBody } = require('./utils/parseRequest'),
    filesModel = require('./mongo/models/filesModel'),
    oldVehiclesModel = require('./mongo/models/oldVehiclesModel'),
    segurosModel = require('./mongo/models/segurosModel'),
    dbSync = require('./sync/dbSyncAPI'),
    deleteVehiclesInsurance = require('./deleteVehiclesInsurance'),
    updateVehicleStatus = require('./taskManager/veiculos/updateVehicleStatus'),
    parametros = require('./parametros/parametros'),
    alerts = require('./alerts/routes'),
    getFormattedDate = require('./utils/getDate'),
    authRouter = require('./auth/authRouter'),
    authToken = require('./auth/authToken'),
    getUser = require('./auth/getUser'),
    users = require('./users/users'),
    getUsers = require('./users/getUsers'),
    checkPermissions = require('./auth/checkPermissions'),
    insertEmpresa = require('./users/insertEmpresa'),
    removeEmpresa = require('./users/removeEmpresa'),
    userSockets = require('./auth/userSockets'),
    fileBackup = require('./fileBackup/fileBackup'),
    prepareBackup = require('./fileBackup/prepareBackup'),
    { permanentBackup } = require('./fileBackup/permanentBackup'),
    taskManager = require('./taskManager/taskManager'),
    errorHandler = require('./utils/errorHandler')


taskManager()
dotenv.config()

if (process.env.NODE_ENV === 'production')
    app.use(morgan(`:method :url :status :response-time ms [:date[clf]]`))
else
    app.use(morgan('dev'))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('client/build'))
app.use(setCorsHeader)

//**********************************    Counter ****************************/
/* let i = 0
app.use(counter(i)) */

//************************************ AUTH AND USERS  *********************** */
app.use('/auth', authRouter)
app.use(authToken)
app.get('/getUser', getUser)

//*************************IO SOCKETS CONNECTION / CONFIG********************* */
let server
if (process.env.NODE_ENV === 'development') {
    server = devServer
    console.log('Socket listening to devServer...')
}
else {
    server = productionServer
    console.log('Socket listening to https server...')
}
//const io = server && require('socket.io').listen(server)
const io = server && require('socket.io').listen(server)
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

app.set('io', io)

//************************************ BINARY DATA *********************** */

let gfs
conn.on('error', console.error.bind(console, 'connection error:'))
conn.once('open', () => {
    gfs = Grid(conn.db)
    gfs.collection('vehicleDocs')
    console.log('Mongo connected to the server.')
})

const { vehicleUpload, empresaUpload } = storage()

app.post('/api/empresaUpload', prepareBackup, empresaUpload.any(), uploadMetadata, (req, res) => {
    //Passa os arquivos para a função fileBackup que envia por webSocket para a máquina local.
    const { filesArray } = req
    fileBackup(req, filesArray)

    if (filesArray && filesArray[0]) {
        io.sockets.emit('insertFiles', { insertedObjects: filesArray, collection: 'empresaDocs' })
        res.json({ file: filesArray })
    } else res.send('No uploads whatsoever...')
})


app.post('/api/vehicleUpload', prepareBackup, vehicleUpload.any(), uploadMetadata, (req, res) => {
    //Passa os arquivos para a função fileBackup que envia por webSocket para a máquina local.
    const { filesArray } = req
    fileBackup(req, filesArray)

    if (filesArray && filesArray[0]) {
        io.sockets.emit('insertFiles', { insertedObjects: filesArray, collection: 'vehicleDocs' })
        res.json({ file: filesArray })
    } else res.send('No uploads whatsoever...')
})

app.get('/api/mongoDownload/', (req, res) => mongoDownload(req, res, gfs))

app.get('/api/getFiles/:collection', (req, res) => getFilesMetadata(req, res, gfs))

app.get('/api/getOneFile/', getOneFileMetadata)

app.put('/api/updateFilesMetadata', async (req, res) => {

    const
        { collection, ids, metadata, id, md5 } = req.body,
        update = {}

    if (!ids) {
        res.send('no file sent to the server')
        return
    }

    Object.entries(metadata).forEach(([k, v]) => {
        update['metadata.' + k] = v
    })

    parsedIds = ids.map(id => new mongoose.mongo.ObjectId(id))
    res.locals.fileIds = ids
    res.locals.collection = collection

    permanentBackup(req, res)

    gfs.collection(collection)

    gfs.files.updateMany(
        { "_id": { $in: parsedIds } },
        { $set: { ...update } },

        async (err, doc) => {
            if (err) console.log(err)
            if (doc) {
                const data = {
                    collection,
                    metadata,
                    ids,
                    primaryKey: 'id'
                }

                io.sockets.emit('updateDocs', data)
                res.send({ doc, ids })
                return
            }
        }
    )
})
//************************************BACKUP - SAVE FILES *************************************** */
//app.post('/files/save', fileBackup)


//************************************CADASTRO PROVISÓRIO DE SEGUROS**************** */
app.post('/api/cadSeguroMongo', (req, res) => {
    const
        { user, body } = req,
        role = user && user.role,
        segModel = new segurosModel(body)

    if (role === 'empresa')
        return res.status(403).send('O usuário não possui permissões para esse cadastro no cadTI.')

    segModel.save(function (err, doc) {
        if (err) console.log(err)
        if (doc) res.locals = { doc }
        res.send('saved in mongoDB')
    })
})


//********************************** PARÂMETROS DO SISTEMA ********************************* */
app.use('/api/parametros', parametros)

//********************************** AVISOS/ALERTAS DO SISTEMA ********************************* */
app.use('/api/avisos', alerts)
//app.post('/alerts/:type', userAlerts)

//************************************USUÁRIOS DO SISTEMA *********************** */
app.get('/api/users', checkPermissions, getUsers)
app.use('/users', users)

/***************************  ROUTER PARA OS PRINCIPAIS COMPONENTES DO SISTEMA ************************* 
tabelas: acessibilidade, altContrato, empresas, equipamentos, empresas_laudo, laudos, modelos(chassi/carroceria), procuradores, 
procuracoes, seguradoras, seguros, socios, solicitacoes(logs), veiculos, lookup(marcas chassi/carroceria)
*/
app.use('/api', router)

//get all dischargedVehicles and download excel spreadsheet
app.get('/api/oldVehiclesXls', async (req, res) => {

    //Checa permissão de usuário
    const { user } = req
    if (!user || user.role === 'empresa')
        res.status(403).send('Não há permissão para esse usuário acessar essa parte do CadTI.')

    const
        dischargedVehicles = await oldVehiclesModel.find().select('-__v -_id').lean(),
        currentDate = getFormattedDate(),

        fileName = `Veículos baixados - ${currentDate}.xlsx`,

        wb = xlsx.utils.book_new(),
        wb_opts = { bookType: 'xlsx', type: 'binary' },
        ws = xlsx.utils.json_to_sheet(dischargedVehicles)

    xlsx.utils.book_append_sheet(wb, ws, 'Veículos baixados')
    xlsx.writeFile(wb, fileName, wb_opts);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

    const stream = fs.createReadStream(fileName);
    stream.on('end', () => res.end());
    stream.pipe(res)
})

//Verifica tentativas de cadastro duplicado no DB
app.get('/api/alreadyExists', async (req, res) => {
    const
        { table, column, value } = req.query,
        query = `SELECT * FROM ${table} WHERE ${column} = '${value}'`,
        mongoQuery = { "Placa": { $in: [value, value.replace('-', '')] } }
    let
        v,
        old,
        foundOne

    //Pesquisa entre veículos ativos e baixados
    if (table === 'veiculos') {
        v = await pool.query(query)
        //Se ativo
        if (v.rows && v.rows[0]) {
            const
                { veiculo_id, placa, situacao } = v.rows[0],
                vehicleFound = { veiculoId: veiculo_id, placa, situacao }
            foundOne = { vehicleFound, status: 'existing' }
        }
        //Se baixado
        else {
            old = await oldVehiclesModel.find(mongoQuery).lean()
            console.log(old)
            if (old.length > 0)
                foundOne = { vehicleFound: old[0], status: 'discharged' }
        }

        //Retorna o veículo ou não impõe restrição
        if (foundOne)
            res.send(foundOne)
        else
            res.send(false)
    }

    //Se a tabela for outra, apenas verifica se existe conforme o critério passado pelo frontEnd
    else {
        const exists = await pool.query(query)
        if (exists.rows && exists.rows[0])
            foundOne = exists.rows[0]
        if (foundOne)
            res.send(true)
        else
            res.send(false)
    }
})

app.post('/api/cadProcuradores', cadProcuradores)

app.post('/api/addElement', (req, res) => {
    const
        { user } = req,
        { table, requestElement } = req.body,
        { keys, values } = parseRequestBody(requestElement)

    if (user.role !== 'admin')
        return res.status(403).send('É preciso permissão de administrador para acessar essa parte do cadTI.')
    console.log("🚀 ~ file: server.js ~ line 550 ~ app.post ~ user.role", user.role)

    let queryString = `INSERT INTO public.${table} (${keys}) VALUES (${values}) RETURNING *`
    console.log("🚀 ~ file: server.js ~ line 561 ~ app.post ~ queryString", queryString)

    pool.query(queryString, async (err, t) => {
        if (err) console.log(err)

        if (t && t.rows) {
            if (table !== 'laudos')
                io.sockets.emit('addElements', { insertedObjects: t.rows, table })
            //Se a tabela for laudos
            else {
                //Emite sockets para atualização dos laudos                        
                const
                    { veiculo_id, codigo_empresa } = requestElement,
                    condition = `WHERE laudos.codigo_empresa = ${codigo_empresa}`

                userSockets({ req, noResponse: true, table, condition, event: 'updateElements' })

                //Atualiza status do veículo e emite sockets para atualização dos laudos
                if (veiculo_id) {
                    req.body.codigoEmpresa = codigo_empresa     //Passa o codigo p o body para o userSockets acessar
                    await updateVehicleStatus([veiculo_id])
                    const vCondition = `WHERE veiculos.veiculo_id = ${veiculo_id}`
                    userSockets({ req, noResponse: true, table: 'veiculos', event: 'updateVehicle', condition: vCondition })
                }
                return res.send(t.rows)
            }
            res.send('Dados inseridos')
        }
    })
})

//Atualiza um elemento da tabela 'seguros'
app.put('/api/updateInsurance', async (req, res) => {

    const { columns, updates, id, vehicleIds } = req.body

    let queryString = ''
    columns.forEach(col => {
        queryString += `
                UPDATE seguros
                SET ${col} = '${updates[col]}'
                WHERE id = ${id};
        `
    })

    await pool.query(queryString, (err, t) => {
        if (err) console.log(err)
        pool.query(seguros, (err, t) => {
            if (err) console.log(err)
            if (t && t.rows) io.sockets.emit('updateInsurance', t.rows)
        })
    })

    let
        condition = '',
        query = `
            SELECT * FROM veiculos
            WHERE `

    if (vehicleIds && vehicleIds[0]) {
        vehicleIds.forEach(id => {
            condition = condition + `veiculos.veiculo_id = '${id}' OR `
        })
        condition = condition.slice(0, condition.length - 3)
        query = query + condition

        await pool.query(query, (err, t) => {
            if (err) console.log(err)
            if (t && t.rows) {
                const data = getUpdatedData('veiculos', `WHERE ${condition}`)
                data.then(async res => {
                    await io.sockets.emit('updateVehicle', res)
                    pool.query(seguros, (err, t) => {
                        if (err) console.log(err)
                        if (t && t.rows) io.sockets.emit('updateInsurance', t.rows)
                    })
                })
            }
        })
        res.send(vehicleIds)
    } else res.send('No changes whatsoever.')
})

//Atualiza um ou mais elementos da tabela 'veículos
app.put('/api/updateInsurances', async (req, res) => {

    const { column, value, placas, deletedVehicles } = req.body
    let { table, ids, tablePK } = req.body

    if (!table)
        table = 'veiculos'
    if (placas) {
        tablePK = 'placa'
        ids = placas
    }

    let condition = ''

    //Se houver veículos para apagar, chamar o método para isso
    if (deletedVehicles) {
        await deleteVehiclesInsurance(deletedVehicles)

        deletedVehicles.forEach(id => {
            condition = condition + `veiculo_id = '${id}' OR `
        })
        condition = condition.slice(0, condition.length - 3)
        console.log("🚀 ~ file: server.js ~ line 727 ~ app.put ~ condition", condition)

        userSockets({ req, res, table: 'veiculos', condition: `WHERE ${condition}`, event: 'updateVehicle', noResponse: true })
    }

    //Se não houver nenhum id, a intenção era só apagar o n de apólice do(s) veículo(s). Nesse caso res = 'no changes'
    if (ids && ids[0]) {
        let query = `
                UPDATE ${table}
                SET ${column} = '${value}'         
                WHERE `

        condition = ''
        ids.forEach(id => {
            condition = condition + `${tablePK} = '${id}' OR `
        })

        condition = condition.slice(0, condition.length - 3)

        query = query + condition + ` RETURNING *`
        //console.log(query)
        await pool.query(query, async (err, t) => {
            if (err) console.log(err)
            if (t && t.rows) {
                await updateVehicleStatus(ids)
                condition = 'WHERE ' + condition     //Adaptando para o userSocket fazer o getUpdatedData
                await userSockets({ req, res, table: 'veiculos', condition, event: 'updateVehicle', noResponse: true }) //noResponse é p não enviar res p o client, sendo a função abaixo vai faze-lo
                userSockets({ req, res, table: 'seguros', event: 'updateInsurance' }) //Atualiza os seguros com o join da coluna apolice dos veiculos atualizada
            }
        })
    }
    else
        res.send('No changes whatsoever.')
})

app.patch('/api/removeEmpresa', async (req, res) => {
    const { cpfsToRemove, codigoEmpresa } = req.body

    if (cpfsToRemove && cpfsToRemove[0])
        await removeEmpresa({ representantes: cpfsToRemove, codigoEmpresa })

    res.send('permission updated.')
})

app.put('/api/editProc', (req, res) => {

    const { requestArray, table, tablePK, keys, codigoEmpresa, updateUser } = req.body
    let queryString = '',
        ids = '',
        i = 0
    console.log(updateUser === 'insertEmpresa', updateUser)
    //Cria a string para o query no Postgresql
    keys.forEach(key => {
        requestArray.forEach(o => {
            if (o.hasOwnProperty(key)) {
                i++
                console.log(i)
                if (key !== 'procurador_id' && i < 2) {
                    ids = ''
                    queryString += `
                    UPDATE ${table} 
                    SET ${key} = CASE ${tablePK} 
                    `
                    requestArray.forEach(obj => {
                        let value = obj[key]
                        if (value) {
                            if (key === 'empresas') value = `ARRAY[${value}]`
                            else if (key !== 'codigo_empresa') value = '\'' + value + '\''
                            if (key === 'data_fim') value += '::date'
                            queryString += `WHEN ${obj.procurador_id} THEN ${value} `

                            if (ids.split(' ').length <= requestArray.length) ids += obj.procurador_id + ', '
                        }

                    })
                    ids = ids.slice(0, ids.length - 2)
                    queryString += `
                    END
                    WHERE ${tablePK} IN (${ids});
                    `
                    ids = ids + ', '
                }
            }
        })
        i = 0
    })
    //Atualiza os procuradores com a string gerada acima
    pool.query(queryString, (err, t) => {
        console.log("🚀 ~ file: server.js ~ line 819 ~ pool.query ~ queryString", queryString)
        if (err) console.log(err)

        if (t) {
            const ids = requestArray.map(el => el.procurador_id)
            let query2 = 'SELECT * FROM procuradores',
                condition = ` WHERE procurador_id = ${ids[0]}`

            ids.forEach((id, i) => {
                if (i > 0)
                    condition += ` OR procurador_id = ${id}`
            })
            query2 += condition
            //Depois de atualizado, faz um select dos procuradores e envia um socket para o client para atualizar em tempo real o estado global(redux)
            pool.query(query2, (error, table) => {
                if (error)
                    console.log(error)
                const update = { data: table.rows, collection: 'procuradores', primaryKey: 'procuradorId' }
                io.sockets.emit('updateProcuradores', update)
                res.send('Dados atualizados.')
            })
            //Atualiza o array de empresas dos usuários
            const updateRequest = { representantes: requestArray, codigoEmpresa }
            if (updateUser === 'insertEmpresa')
                insertEmpresa(updateRequest)
            /*  if (updateUser === 'removeEmpresa')
                 removeEmpresa(updateRequest); */
        }
        else res.send('something went wrong with your update...')
    })
})

app.delete('/api/deleteFile', async (req, res) => {
    const
        { id, collection } = req.query,
        fileId = new mongoose.mongo.ObjectId(id)

    let chunks
    gfs.collection(collection)

    gfs.files.deleteOne({ _id: fileId }, (err, result) => {
        if (err) console.log(err)
        if (result) console.log(result)
    })

    if (collection === 'empresaDocs') chunks = empresaChunks
    if (collection === 'vehicleDocs') chunks = vehicleChunks

    chunks.deleteMany({ files_id: fileId }, (err, result) => {
        if (err) console.log(err)
        if (result) {
            console.log(result)
            res.json(result)
        }
    })
    io.sockets.emit('deleteOne', { tablePK: '_id', id, collection })
})

app.get('/api/deleteManyFiles', async (req, res) => {
    const
        { id } = req.query

    console.log(id, typeof id)
    const docsToDelete = { 'metadata.veiculoId': id }

    gfs.collection('vehicleDocs')

    const getIds = await filesModel.filesModel.find(docsToDelete).select('_ids')

    const ids = getIds.map(e => new mongoose.mongo.ObjectId(e._id))

    //let chunks
    gfs.collection('vehicleDocs')
    let r
    ids.forEach(fileId => {
        gfs.files.deleteOne({ _id: fileId }, (err, result) => {
            if (err)
                console.log(err)
            if (result)
                r = result
        })
        //        if (collection === 'empresaDocs') chunks = empresaChunks
        //      if (collection === 'vehicleDocs') chunks = vehicleChunks

        vehicleChunks.deleteMany({ files_id: fileId }, (err, result) => {
            if (err) console.log(err)
            if (result) {
            }
        })
    })
    res.send(r || 'no files deleted.')
    //    io.sockets.emit('deleteOne', { tablePK: '_id', id, collection })
})

app.delete('/api/removeProc', (req, res) => {
    const { codigo_empresa, procurador_id } = req.body

    pool.query(`
    DELETE FROM public.procuracoes    
    WHERE codigo_empresa = ${codigo_empresa}
    AND WHERE procurador_id = ${procurador_id}
`
    )
})

app.use('/sync', dbSync)

if (process.env.NODE_ENV === 'production') {
    app.get('/*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'))
    })
}
app.get('/a', (req, res) => {
    throw new Error('not implemented')
})

app.use(...errorHandler)

if (require.main === module) {
    server.listen(process.env.PORT || 3001, () => {
        console.info('NodeJS server running on port ' + (process.env.PORT || 3001))
    })
}


module.exports = app
