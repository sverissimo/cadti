const mongoose = require('mongoose')
const mongoURI = (process.env.MONGODB_URI || 'mongodb://localhost:27017/sismob_db')

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, debug: true })

const conn = mongoose.connection

module.exports = { conn, mongoURI }