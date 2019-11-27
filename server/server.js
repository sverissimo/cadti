const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const pg = require('pg')
//const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
Grid.mongo = mongoose.mongo;

const { cadEmpresa } = require('./cadEmpresa')
const { cadSocios } = require('./cadSocios')
const { cadProcuradores } = require('./cadProcuradores')

const { empresas, veiculoInit, modeloChassi, carrocerias, equipamentos, seguradoras, seguros } = require('./queries')
const { filesModel } = require('./models/filesModel')

const { uploadFS } = require('./upload')
const { parseRequestBody } = require('./parseRequest')

dotenv.config()
app.use(bodyParser.json())

app.use(function (req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", true);
    next()
})

//app.use(bodyParser.json())

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded())
app.use(express.static('client/build'))


const Pool = pg.Pool
let pool = new Pool({
    user: process.env.DB_USER || process.env.USER,
    host: process.env.DB_HOST || process.env.HOST,
    database: process.env.DB || process.env.DATABASE,
    password: process.env.DB_PASS || process.env.PASSWORD,
    port: 5432
})
if (process.env.NODE_ENV === 'production') pool = new Pool({ connectionString: process.env.DATABASE_URL })

const mongoURI = (process.env.MONGODB_URI || 'mongodb://localhost:27017/sismob_db')
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, debug: true });

const conn = mongoose.connection
let gfs

conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => {
    gfs = Grid(conn.db);
    gfs.collection('vehicleDocs');
    console.log('Mongo connected!')
})

const storage = new GridFsStorage({

    url: mongoURI,
    file: (req, file) => {
        gfs.collection('vehicleDocs');
        const id = req.body.veiculoId || req.body.empresa
        const fileInfo = {
            filename: file.originalname,
            metadata: {
                'fieldName': file.fieldname,
                'veiculoId': id
            },
            bucketName: 'vehicleDocs',
        }
        return fileInfo
    }
})

const empresaStorage = new GridFsStorage({

    url: mongoURI,
    file: (req, file) => {
        gfs.collection('empresaDocs');
        const { empresa, fieldName } = req.body
        const fileInfo = {
            filename: file.originalname,
            metadata: {
                'fieldName': fieldName,
                'cpfProcurador': file.fieldname,
                'empresa': empresa
            },
            bucketName: 'empresaDocs',
        }
        return fileInfo
    }
})

const upload = multer({ storage })
const empresaUpload = multer({ storage: empresaStorage })

app.post('/api/empresaUpload', empresaUpload.any(), (req, res) => {

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

app.post('/api/mongoUpload', upload.any(), (req, res) => {

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

app.get('/api/mongoDownload/:id', (req, res) => {

    const fileId = new mongoose.mongo.ObjectId(req.params.id)
    gfs.files.findOne({ _id: fileId }, (err, file) => {

        if (!file) {
            return res.status(404).json({
                responseMessage: err,
            });
        } else {

            const readstream = gfs.createReadStream({
                filename: file.filename,
            });

            res.set({
                'Content-Type': file.contentType,
                'Content-Disposition': 'attachment',
            });
            return readstream.pipe(res)
        }
    })
})

app.get('/api/vehicleFiles', (req, res) => {

    filesModel.find().sort({ uploadDate: -1 }).exec((err, doc) => res.send(doc))
   
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

app.get('/api/socios', (req, res) => {
    pool.query(
        `SELECT public.socios.*, public.delegatario.razao_social
         FROM public.socios 
         LEFT JOIN public.delegatario 
         ON delegatario.delegatario_id = socios.delegatario_id
         ORDER BY nome_socio ASC`, (err, table) => {
        if (err) res.send(err)
        else if (table.rows.length === 0) { res.send('Nenhum socios cadastrado para esse delegatário.'); return }
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

app.post('/api/cadEmpresa', cadEmpresa)

app.post('/api/cadSocios', cadSocios)

app.post('/api/empresaFullCad', cadEmpresa, cadSocios, cadProcuradores);

app.get('/api/modeloChassi', (req, res) => {
    pool.query(modeloChassi, (err, table) => {
        if (err) res.send(err)
        else if (table.rows && table.rows.length === 0) { res.send('Nenhum veículo cadastrado para esse delegatário.'); return }
        res.json(table.rows)
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
})

app.put('/api/updateVehicle', (req, res) => {

    const { requestObject, table, tablePK, id } = req.body
    let queryString = ''

    Object.entries(requestObject).forEach(([k, v]) => {
        queryString += `${k} = '${v}', `
    })

    queryString = `UPDATE ${table} SET ` +
        queryString.slice(0, queryString.length - 2) +
        ` WHERE ${tablePK} = '${id}'`

    pool.query(queryString, (err, t) => {
        if (err) console.log(err)
        res.send(`${table} table changed fields in ${id}`)
    }
    )
})

app.get('/api/deleteFiles/:reqId', (req, res) => {
    const { reqId } = req.params

    filesModel.find().exec((err, doc) => {
        if (err) console.log(err)
        const files = doc.filter(f => f.metadata.veiculoId === reqId)

        files.forEach(file => {
            let fileId = new mongoose.mongo.ObjectId(file._id)
            gfs.files.remove({ _id: fileId }, (err) => {
                if (err) console.log(err)
            })
        })
        res.send('File deleted!')
    })
})


if (process.env.NODE_ENV === 'production') {
    app.get('/*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'))
    })
}

app.listen(process.env.PORT || 3001, () => {
    console.log('Running...')
})