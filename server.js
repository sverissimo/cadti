const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const pg = require('pg')
const dotenv = require('dotenv')

dotenv.config()
app.use(bodyParser.json())

const HOST = '127.0.0.1'
const PORT = 3001

const Pool = pg.Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB,
    password: process.env.DB_PASS,
    port: 5432
})
console.log(process.env.DB, process.env.DB_USER)

app.get('/api/empresas', (req, res) => {
    pool.query('SELECT * FROM public.delegatarios ORDER BY "razaoSocial"', (err, table) => {
        if (err) throw err
        let a = []
        //table.rows.map(r=> a.push(r.nomeMarca))
        res.json(table)
    })
})

app.listen(PORT, HOST)

console.log('Running on port 3001, dude...')