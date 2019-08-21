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
        res.json(table.rows)
    })
})

app.get('/api/veiculo/:id', (req, res) => {
    const { id } = req.params
    const { column, filter } = req.query

    pool.query(`SELECT ${column} FROM public.veiculo WHERE ${filter} = $1`, [id], (err, table) => {
        if (err) res.send(err)
        if (table.rows.length === 0) {res.send('Veículo não encontrado.'); return}
        res.json(table.rows.map(r=> r[column]))
    })
})

app.listen(PORT, HOST)

console.log('Running on port 3001, dude...')