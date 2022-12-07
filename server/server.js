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
    Grid = require('gridfs-stream')
Grid.mongo = mongoose.mongo

//Componentes do sistema
const
    { setCorsHeader } = require('./config/setCorsHeader'),
    router = require('./routes'),
    { createSocketConnection } = require('./sockets/createSocketConnection'),
    dbSync = require('./sync/dbSyncAPI'),
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
