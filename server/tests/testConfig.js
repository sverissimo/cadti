//@ts-check
const dotenv = require('dotenv')
dotenv.config()

const testHeaders = {
    'authorization': process.env.FILE_SECRET,
    'host': 'localhost',
}

const defaultOptions = {
    host: 'localhost',
    port: 3001,
    headers: {
        ...testHeaders
    }
}


module.exports = { testHeaders, defaultOptions }
