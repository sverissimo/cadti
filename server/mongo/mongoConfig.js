const
    mongoose = require('mongoose'),
    mongoURI = (process.env.MONGODB_URI || 'mongodb://localhost:27017/sismob_db'),
    options = {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        debug: true
    }

mongoose.connect(mongoURI, options)
const conn = mongoose.connection

module.exports = { conn, mongoURI }