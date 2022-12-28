//@ts-check
const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const morgan = require('morgan')
const { setCorsHeader } = require('./config/setCorsHeader')
const router = require('./routes')
const dbSync = require('./sync/dbSyncAPI')
const authRouter = require('./auth/authRouter')
const authToken = require('./auth/authToken')
const taskManager = require('./taskManager/taskManager')
const errorHandler = require('./utils/errorHandler')
const { fileRouter: useFileRouter } = require('./routes/fileRoutes')
const { setUserPermissions } = require('./auth/setUserPermissions')

taskManager()
dotenv.config()

const app = express()
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
app.use(setUserPermissions)
app.use('/api', router)
app.use('/sync', dbSync)
useFileRouter(app)

if (process.env.NODE_ENV === 'production') {
    app.get('/*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'))
    })
}
app.use(...errorHandler)

module.exports = app