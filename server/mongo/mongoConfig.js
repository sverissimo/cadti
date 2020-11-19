const
    mongoose = require('mongoose'),
    mongoURI = (process.env.MONGODB_URI || 'mongodb://localhost:27017/sismob_db'),
    options = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        debug: true
    }

mongoose.connect(mongoURI, options)
mongoose.set('useUnifiedTopology', true)

const conn = mongoose.connection

module.exports = { conn, mongoURI }