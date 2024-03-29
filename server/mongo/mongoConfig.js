const
    mongoose = require('mongoose'),
    mongoURI = (process.env.MONGODB_URI || 'mongodb://localhost:27017/sismob_db'),
    options = {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    }

mongoose.connect(mongoURI, options)
mongoose.set('toJSON', {
    virtuals: true,
    transform: (doc, converted) => {
        delete converted._id;
    }
});
const conn = mongoose.connection

module.exports = { conn, mongoURI }