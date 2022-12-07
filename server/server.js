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
    morgan = require('morgan'),
    xlsx = require('xlsx'),
    Grid = require('gridfs-stream')
Grid.mongo = mongoose.mongo

//Componentes do sistema
const
    { setCorsHeader } = require('./config/setCorsHeader'),
    router = require('./routes'),
    { createSocketConnection } = require('./sockets/createSocketConnection'),
    { empresaChunks, vehicleChunks } = require('./mongo/models/chunksModel'),
    filesModel = require('./mongo/models/filesModel'),
    oldVehiclesModel = require('./mongo/models/oldVehiclesModel'),
    dbSync = require('./sync/dbSyncAPI'),
    getFormattedDate = require('./utils/getDate'),
    authRouter = require('./auth/authRouter'),
    authToken = require('./auth/authToken'),
    taskManager = require('./taskManager/taskManager'),
    errorHandler = require('./utils/errorHandler'),
    { fileRouter: useFileRouter } = require('./routes/fileRoutes')


taskManager()
dotenv.config()

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('client/build'))
app.use(setCorsHeader)
app.use(morgan('dev'))
if (process.env.NODE_ENV === 'production') {
    app.use(morgan(':method :url :status :response-time ms [:date]'))
}

app.use('/auth', authRouter)
app.use(authToken)

let server
if (process.env.NODE_ENV === 'development') {
    server = devServer
    console.log('Socket listening to devServer...')
}
else {
    server = productionServer
    console.log('Socket listening to https server...')
}

const io = createSocketConnection(app, server)
app.set('io', io)

useFileRouter(app)
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
