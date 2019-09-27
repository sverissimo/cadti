const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const pg = require('pg')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

const { empresas, veiculoInit, modeloChassi, carrocerias, equipamentos, seguradoras, seguros } = require('./queries')
const { upload } = require('./upload');


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

app.get('/api/empresas', (req, res) => pool.query(empresas, (err, table) => {
    if (err) res.send(err)
    if (table.rows.length === 0) { res.send('Nenhum delegatário cadastrado.'); return }
    res.json(table.rows)
})
)

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

    pool.query(veiculoInit, (err, table) => {
        if (err) res.send(err)
        else if (table.rows.length === 0) { res.send('Nenhum veículo cadastrado para esse delegatário.'); return }
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
        else if (table.rows.length === 0) { res.send('Nenhum procurador cadastrado para esse delegatário.'); return }
        res.json(table.rows)
    })
})

app.get('/api/veiculos', (req, res) => {
    const { id } = req.query

    pool.query(
        `SELECT * FROM public.veiculo WHERE delegatario_id = $1`, [id], (err, table) => {

            if (err) res.send(err)
            else if (table.rows.length === 0) { res.send('Nenhum veículo cadastrado para esse delegatário.'); return }
            res.json(table.rows)
        })
})

app.post('/api/cadastroVeiculo', (req, res) => {

    let parsed = []
    console.log(req.body)
    const keys = Object.keys(req.body).toString(),
        values = Object.values(req.body)

    values.forEach(v => {
        parsed.push(('\'' + v + '\'').toString())
    })

    parsed = parsed.toString().replace(/'\['/g, '').replace(/'\]'/g, '')
    console.log(`INSERT INTO public.veiculo (${keys}) VALUES (${parsed}) RETURNING *`)
    pool.query(
        `INSERT INTO public.veiculo (${keys}) VALUES (${parsed}) RETURNING *`, (err, table) => {
            if (err) res.send(err)
            if (table && table.rows && table.rows.length === 0) { res.send('Nenhum veículo cadastrado para esse delegatário.'); return }
            if (table.rows.length > 0 ) res.json(table.rows)
            return
        })
})

app.get('/api/modeloChassi', (req, res) => {
    pool.query(modeloChassi, (err, table) => {
        if (err) res.send(err)
        else if (table.rows && table.rows.length === 0) { res.send('Nenhum veículo cadastrado para esse delegatário.'); return }
        res.json(table.rows);
    })
})

app.get('/api/carrocerias', (req, res) => {
    pool.query(carrocerias, (err, table) => {
        if (err) res.send(err)
        else if (table.rows && table.rows.length === 0) { res.send('Nenhum veículo cadastrado para esse delegatário.'); return }
        res.json(table.rows)
    })
})

app.post('/api/upload', upload)

app.get('/api/download', (req, res) => {
    const fPath = path.join(__dirname, '../files', 'a.xls')
    res.set({
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition': 'attachment'
    });

    //const pathZ = path.resolve(__dirname, '../files', 'delegas.xls')
    const stream = fs.createReadStream(fPath, { autoClose: true })

    stream.on('close', () => res.end())
    stream.pipe(res)

})

app.get('/api/equipa', (req, res) => {
    pool.query(equipamentos, (err, table) => {
        if (err) res.send(err)
        else if (table.rows && table.rows.length === 0) { res.send('Nenhum equipamento encontrado.'); return }
        res.json(table.rows);
    })
})

app.get('/api/seguros', (req, res) => {
    pool.query(seguros, (err, table) => {
        if (err) res.send(err)
        else if (table.rows && table.rows.length === 0) { res.send('Nenhum equipamento encontrado.'); return }
        res.json(table.rows);
    })
})

app.get('/api/seguradoras', (req, res) => {
    pool.query(seguradoras, (err, table) => {
        if (err) res.send(err)
        else if (table.rows && table.rows.length === 0) { res.send('Nenhum equipamento encontrado.'); return }
        res.json(table.rows);
    })
})

app.post('/api/cadSeguro', (req, res) => {
    let parsed = []
    console.log(req.body)
    const keys = Object.keys(req.body).toString(),
        values = Object.values(req.body)

    values.forEach(v => {
        parsed.push(('\'' + v + '\'').toString())
    })

    parsed = parsed.toString().replace(/'\['/g, '').replace(/'\]'/g, '')
    console.log(`INSERT INTO public.seguro (${keys}) VALUES (${parsed}) RETURNING *`)
    pool.query(
        `INSERT INTO public.seguro (${keys}) VALUES (${parsed}) RETURNING *`, (err, table) => {
            if (err) res.send(err)
            if (table && table.rows && table.rows.length === 0) { res.send('Nenhum seguro cadastrado.'); return }
            if (table && table.rows.length > 0 ) res.json(table.rows)
            return
        })
});

app.listen(PORT, HOST)
console.log('Running on port 3001, dude...')