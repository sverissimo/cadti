const pg = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const Pool = pg.Pool
let pool = new Pool({
    user: process.env.DB_USER || process.env.USER,
    host: process.env.DB_HOST || process.env.HOST,
    database: process.env.DB || process.env.DATABASE,
    password: process.env.DB_PASS || process.env.PASSWORD,
    port: 5432
})

module.exports = { pool }