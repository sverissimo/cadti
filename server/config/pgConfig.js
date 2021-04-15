const pg = require('pg')
const dotenv = require('dotenv')

dotenv.config()
if (!process.env.DB_USER)
    dotenv.config({ path: '../../../.env' })

const Pool = pg.Pool
let pool = new Pool({
    user: process.env.DB_USER || process.env.USER,
    host: process.env.DB_HOST || process.env.HOST,
    database: process.env.DB || process.env.DATABASE,
    password: process.env.DB_PASS || process.env.PASSWORD,
    port: 5432
})

//if (process.env.NODE_ENV === 'production') pool = new Pool({ connectionString: process.env.DATABASE_URL })

module.exports = { pool }