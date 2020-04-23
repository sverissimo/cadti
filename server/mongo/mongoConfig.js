const mongoose = require('mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
Grid.mongo = mongoose.mongo

const mongoURI = (process.env.MONGODB_URI || 'mongodb://localhost:27017/sismob_db')
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, debug: true })

const conn = mongoose.connection
let gfs

conn.on('error', console.error.bind(console, 'connection error:'))

const gfsPromise = new Promise((resolve, reject) => {
    const gridConnect = conn.once('open', () => {
        gfs = Grid(conn.db);
        gfs.collection('vehicleDocs')
        console.log('Mongo connected.')
    })
    resolve(gridConnect)
})

module.exports = { conn, mongoURI, gfsPromise }