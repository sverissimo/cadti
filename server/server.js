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
    { empresaChunks, vehicleChunks } = require('./mongo/models/chunksModel'),
    filesModel = require('./mongo/models/filesModel'),
    oldVehiclesModel = require('./mongo/models/oldVehiclesModel'),
    dbSync = require('./sync/dbSyncAPI'),
    parametros = require('./parametros/parametros'),
    alerts = require('./alerts/routes'),
    getFormattedDate = require('./utils/getDate'),
    authRouter = require('./auth/authRouter'),
    authToken = require('./auth/authToken'),
    getUser = require('./auth/getUser'),
    users = require('./users/users'),
    getUsers = require('./users/getUsers'),
    checkPermissions = require('./auth/checkPermissions'),
    fileBackup = require('./fileBackup/fileBackup'),
    prepareBackup = require('./fileBackup/prepareBackup'),
    { permanentBackup } = require('./fileBackup/permanentBackup'),
    taskManager = require('./taskManager/taskManager'),
    errorHandler = require('./utils/errorHandler'),
    { SeguroService } = require('./services/SeguroService'),
    { Controller } = require('./controllers/Controller'),
    { VeiculoService } = require('./services/VeiculoService')


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

//********************************** PARÂMETROS DO SISTEMA ********************************* */
app.use('/api/parametros', parametros)

//********************************** AVISOS/ALERTAS DO SISTEMA ********************************* */
app.use('/api/avisos', alerts)
//app.post('/alerts/:type', userAlerts)

//************************************USUÁRIOS DO SISTEMA *********************** */
app.get('/api/users', checkPermissions, getUsers)
app.use('/users', users)


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

app.post('/api/addElement', new Controller().addElement)
//Atualiza um elemento da tabela 'seguros'
app.put('/api/updateInsurance', SeguroService.updateInsurance)
//Atualiza um ou mais elementos da tabela 'veículos
app.put('/api/updateInsurances', VeiculoService.updateInsurance)

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

app.use(...errorHandler)

if (require.main === module) {
    server.listen(process.env.PORT || 3001, () => {
        console.info('NodeJS server running on port ' + (process.env.PORT || 3001))
    })
}


module.exports = app
