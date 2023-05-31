//@ts-check
const express = require('express')
const path = require('path')
const helmet = require('helmet');
const dotenv = require('dotenv')
const morgan = require('morgan')
const { setCorsHeader } = require('./config/setCorsHeader')
const router = require('./routes')
const dbSync = require('./sync/dbSyncAPI')
const authRouter = require('./auth/authRouter')
const authToken = require('./auth/authToken')
const errorHandler = require('./utils/errorHandler')
const { fileRouter: useFileRouter } = require('./routes/fileRoutes')
const { setUserPermissions } = require('./auth/setUserPermissions')

dotenv.config()

const app = express()
app.use(helmet.default({ contentSecurityPolicy: false }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('client/build'))
app.use(setCorsHeader)

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', true);
    morgan.token('x-forwarded-for', (req, res) => {
        //@ts-ignore
        let header = req.headers['x-forwarded-for'] || req.ip
        if (Array.isArray(header)) {
            return header.join(', ')
        }
        return header
    })
    app.use(morgan(':method :url :status :response-time ms [:date] - :x-forwarded-for'))
} else {
    app.use(morgan('dev'))
}

app.use('/auth', authRouter)
app.use(authToken)
app.use(setUserPermissions)
app.use('/api', router)
app.use('/sync', dbSync)
useFileRouter(app)

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test_production') {
    app.get('/*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'))
    })
}
app.use(...errorHandler)

module.exports = app
