//@ts-check
const fs = require('fs')
const https = require('https')
const http = require('http')
const app = require('./app')
const { createSocketConnection } = require('./sockets/createSocketConnection')
const { conn } = require("./mongo/mongoConfig")
const taskManager = require('./taskManager/taskManager')

const port = process.env.PORT || 3001
let server

if (process.env.NODE_ENV === 'production') {
    const httpsOptions = {
        key: fs.readFileSync("/sismob/certificates/localhost.key"),
        cert: fs.readFileSync("/sismob/certificates/localhost.crt"),
    }
    server = https.createServer(httpsOptions, app)
} else {
    server = http.createServer(app)
}

conn.on('error', console.error.bind(console, 'connection error:'))
conn.once('open', () => console.log('MongoDB connected to the server.'))

if (process.env.NODE_ENV === 'production') {
    taskManager()
}

const io = createSocketConnection(app, server)
app.set('io', io)

server.listen(port, () => console.info(`NodeJS server running on port ${port}...`))
