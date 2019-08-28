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
});

app.get('/api/empresas', (req, res) => {
    pool.query('SELECT * FROM public.delegatario ORDER BY "delegatario_id"', (err, table) => {
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
        if (table.rows.length === 0) { res.send('Veículo não encontrado.'); return }
        res.json(table.rows.map(r => r[column]))
    })
})

app.get('/api/veiculosInit', (req, res) => {

    pool.query(`
        SELECT public.veiculo.*, public.modelo_chassi.marca_chassi as marca
        FROM veiculo
        LEFT JOIN public.modelo_chassi
        ON veiculo.modelochassi_id = public.modelo_chassi.modelo_chassi
        ORDER BY data_registro ASC`, (err, table) => {
            if (err) res.send(err)
            if (table.rows.length === 0) { res.send('Nenhum veículo cadastrado para esse delegatário.'); return }
            res.json(table.rows)
        })
})

app.get('/api/procuradores', (req, res) => {
    pool.query(
        `SELECT public.procurador.*, public.delegatario.razao_social
         FROM public.procurador 
         LEFT JOIN public.delegatario 
         ON delegatario.delegatario_id = procurador.delegatario_id
         ORDER BY nome_procurador ASC`, (err, table) => {
            if (err) res.send(err)
            if (table.rows.length === 0) { res.send('Nenhum procurador cadastrado para esse delegatário.'); return }
            res.json(table.rows)
        })
})

app.get('/api/delegatarios', (req, res) => {

    pool.query(
        `SELECT delegatario.*, ARRAY_AGG(DISTINCT procurador.nome_procurador) AS procuradores_list
         FROM delegatario
         LEFT JOIN procurador
         ON procurador.delegatario_id = delegatario.delegatario_id    
	     GROUP BY delegatario.delegatario_id;`, (err, table) => {
            if (err) res.send(err)
            if (table.rows.length === 0) { res.send('Nenhum delegatário cadastrado.'); return }
            res.json(table.rows)
        })
})

app.get('/api/veiculos', (req, res) => {
    const { id } = req.query

    pool.query(
        `SELECT * FROM public.veiculo WHERE delegatario_id = $1`, [id], (err, table) => {

            if (err) res.send(err)
            if (table.rows.length === 0) { res.send('Nenhum veículo cadastrado para esse delegatário.'); return }
            res.json(table.rows)
        })
})

app.listen(PORT, HOST)

console.log('Running on port 3001, dude...')