//@ts-check
const pg = require('pg')
const dotenv = require('dotenv')

dotenv.config()
if (!process.env.DB_USER)
    dotenv.config({ path: '../../.env' })

const Pool = pg.Pool
const pool = new Pool({
    host: process.env.TEST_DB_HOST,
    database: process.env.TEST_DB,
    user: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASS,
    port: 5432
})

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


module.exports = { pool, testHeaders, defaultOptions }