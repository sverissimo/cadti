const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const pg = require('pg')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')


const { empresas, veiculoInit, modeloChassi, carrocerias, equipamentos, seguradoras, seguros } = require('./queries')
const { uploadFS } = require('./upload')
const { parseRequestBody } = require('./parseRequest')

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

const mongoURI = 'mongodb://localhost:27017/sismob_db'
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('were connected!');
});

const storage = new GridFsStorage({

    url: mongoURI,
    file: (req, file) => {
        const fileInfo = {
            filename: file.originalname,
            metadata: {
                'fieldName': file.fieldname,
                'processId': req.body.processId
            },
            bucketName: 'uploads',
        }
        console.log(fileInfo)
        return fileInfo
    }
});

const upload = multer({ storage });

app.post('/api/fileUpload', upload.any(), (req, res) => {
    let filesArray = []
    if (req.files) req.files.forEach(f => {
        filesArray.push({
            fieldName: f.fieldname,
            id: f.id,
            originalName: f.originalname,
            uploadDate: f.uploadDate,
            contentType: f.contentType,
            fileSize: f.size
        })
    })
    res.json({ file: filesArray });
})
/*    storage = new mongoose.mongo.GridFSBucket(connection.db);

console.log(storage) */










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

app.get('/api/socios', (req, res) => {
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

    const { keys, values } = parseRequestBody(req.body)

    console.log(`INSERT INTO public.veiculo (${keys}) VALUES (${values}) RETURNING *`)
    pool.query(
        `INSERT INTO public.veiculo (${keys}) VALUES (${values}) RETURNING *`, (err, table) => {
            if (err) res.send(err)
            if (table && table.rows && table.rows.length === 0) { res.send('Nenhum veículo cadastrado para esse delegatário.'); return }
            if (table.rows.length > 0) res.json(table.rows)
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

app.post('/api/upload', uploadFS)

app.get('/api/download', (req, res) => {
    const fPath = path.join(__dirname, '../files', 'a.txt')
    res.set({
        'Content-Type': 'text',
        'Content-Disposition': 'attachment'
    });

    //const pathZ = path.resolve(__dirname, '../files', 'delegas.xls')
    /* const stream = fs.createReadStream(fPath, { autoClose: true })

    stream.on('close', () => res.end())
    stream.pipe(res) */
    res.download(fPath)

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
            if (table && table.rows.length > 0) res.json(table.rows)
            return
        })
})

app.delete('/api/delete', (req, res) => {
    const { table, tablePK } = req.query
    let { id } = req.query

    if (table === 'seguro') id = '\'' + id + '\''

    pool.query(`
    DELETE FROM public.${table} WHERE ${tablePK} = ${id}`, (err, t) => {
        if (err) console.log(err)
        res.send(`${id} deleted from ${table}`)
    })
})

app.put('/api/updateInsurance', (req, res) => {
    const { table, tablePK, column } = req.body
    let { value, id } = req.body

    id = '\'' + id + '\''
    value = '\'' + value + '\''

    console.log(`
    UPDATE ${table}
    SET ${column} = ${value}
    WHERE ${tablePK} = ${id}
    `)

    pool.query(`
    UPDATE ${table} SET ${column} = ${value} WHERE ${tablePK} = ${id}`, (err, t) => {
        if (err) console.log(err)
        res.send(`${column} changed to ${value}`)
    }
    )
})

app.get('/api/getUpdatedInsurance', (req, res) => {
    let { apolice } = req.query
    apolice = '\'' + apolice + '\''
    console.log(req.query, `
    SELECT seguro.*,
        s.seguradora,
        array_to_json(array_agg(v.veiculo_id)) veiculos,
        array_to_json(array_agg(v.placa)) placas,
        d.razao_social empresa,
        d.delegatario_id,
        cardinality(array_agg(v.placa)) segurados
    FROM seguro
    INNER JOIN veiculo v
        ON seguro.apolice = v.apolice
        AND seguro.apolice = ${apolice}
    LEFT JOIN delegatario d
        ON d.delegatario_id = v.delegatario_id
    LEFT JOIN seguradora s
        ON s.id = seguro.seguradora_id
    GROUP BY seguro.apolice, d.razao_social, s.seguradora, d.delegatario_id
    ORDER BY seguro.vencimento ASC        
        `)

    pool.query(`
    SELECT seguro.*,
        s.seguradora,
        array_to_json(array_agg(v.veiculo_id)) veiculos,
        array_to_json(array_agg(v.placa)) placas,
        d.razao_social empresa,
        d.delegatario_id,
        cardinality(array_agg(v.placa)) segurados
    FROM seguro
    INNER JOIN veiculo v
        ON seguro.apolice = v.apolice
        AND seguro.apolice = ${apolice}
    LEFT JOIN delegatario d
        ON d.delegatario_id = v.delegatario_id
    LEFT JOIN seguradora s
        ON s.id = seguro.seguradora_id
    GROUP BY seguro.apolice, d.razao_social, s.seguradora, d.delegatario_id
    ORDER BY seguro.vencimento ASC        
        `,

        (err, table) => {
            if (err) res.send(err)
            else if (table.rows && table.rows.length === 0) { res.send(table); return }
            res.json(table.rows);
        })
});

app.put('/api/updateVehicle', (req, res) => {

    const { requestObject, table, tablePK, id } = req.body
    let queryString = ''

    Object.entries(requestObject).forEach(([k, v]) => {
        queryString += `${k} = '${v}', `
    })

    queryString = `UPDATE ${table} SET ` +
        queryString.slice(0, queryString.length - 2) +
        ` WHERE ${tablePK} = '${id}'`

    console.log(queryString)

    pool.query(queryString, (err, t) => {
        if (err) console.log(err)
        res.send(`${table} table changed fields in ${id}`)
    }
    )
})


app.listen(PORT, HOST)
console.log('Running on port 3001, dude...')