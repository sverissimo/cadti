const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)
const bodyParser = require('body-parser')
const pg = require('pg')
const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
Grid.mongo = mongoose.mongo

const { cadEmpresa } = require('./cadEmpresa')
const { cadSocios } = require('./cadSocios')
const { cadProcuradores } = require('./cadProcuradores')

const { empresas, veiculoInit, modeloChassi, carrocerias, equipamentos, seguradoras,
    seguros, socios } = require('./queries')

const { getUpdatedData } = require('./getUpdatedData')
const { filesModel } = require('./models/filesModel')
const { empresaModel } = require('./models/empresaModel')
const { empresaChunks } = require('./models/chunksModel')

const { uploadFS } = require('./upload')
const { parseRequestBody } = require('./parseRequest')

dotenv.config()
app.use(bodyParser.json())

app.use(function (req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.header("Access-Control-Allow-Credentials", true)
    next()
})

//app.use(bodyParser.json())

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded())
app.use(express.static('client/build'));

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
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, debug: true })

const conn = mongoose.connection
let gfs

conn.on('error', console.error.bind(console, 'connection error:'))
conn.once('open', () => {
    gfs = Grid(conn.db);
    gfs.collection('vehicleDocs')
    console.log('Mongo connected!')
})

const storage = new GridFsStorage({

    url: mongoURI,
    file: (req, file) => {
        gfs.collection('vehicleDocs');

        let metadata = { ...req.body }
        metadata.fieldName = file.fieldname

        const fileInfo = {
            filename: file.originalname,
            metadata,
            bucketName: 'vehicleDocs',
        }
        return fileInfo
    }
})

const empresaStorage = new GridFsStorage({

    url: mongoURI,
    file: (req, file) => {
        gfs.collection('empresaDocs')
        const { fieldName, empresaId, procuracaoId } = req.body
        let { procuradores } = req.body

        if (procuradores) {
            procuradores = procuradores.split(',')
            procuradores = procuradores.map(id => Number(id))
        }

        let fileInfo = {
            filename: file.originalname,
            metadata: {
                'fieldName': fieldName,
                'empresaId': empresaId,
                'procuracaoId': procuracaoId,
                'procuradores': procuradores
            },
            bucketName: 'empresaDocs',
        }

        if (file.fieldname === 'contratoSocial') {
            fileInfo.metadata = {
                'fieldName': file.fieldname,
                'empresaId': empresaId
            }
        } else {
            let { ...metadata } = req.body
            fileInfo.metadata = metadata
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

app.get('/api/mongoDownload/', (req, res) => {

    console.log(typeof req.query.id, req.query.id)
    const fileId = new mongoose.mongo.ObjectId(req.query.id)

    const collection = req.query.collection

    gfs.collection(collection)
    gfs.files.findOne({ _id: fileId }, (err, file) => {

        if (!file) {
            return res.status(404).json({
                responseMessage: err,
            })
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

app.get('/api/getFiles/:collection', (req, res) => {

    let filesCollection, fieldName

    if (req.params.collection === 'vehicleDocs') filesCollection = filesModel
    if (req.params.collection === 'empresaDocs') filesCollection = empresaModel
    if (req.query.fieldName) fieldName = { 'metadata.fieldName': req.query.fieldName }

    filesCollection.find(fieldName).sort({ uploadDate: -1 }).exec((err, doc) => res.send(doc))

})

app.get('/api/getOneFile/', (req, res) => {

    const { collection, id } = req.query

    let filesCollection = empresaModel
    if (collection === 'vehicleDocs') filesCollection = filesModel

    filesCollection.find({ 'metadata.procuracaoId': id.toString() }).exec((err, doc) => res.send(doc))

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


//************************************ No Binary Data ************************** */


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

app.get('/api/veiculos', (req, res) => {

    pool.query(veiculoInit, (err, table) => {
        if (err) res.send(err)
        else if (table.rows.length === 0) { res.send('Nenhum veículo cadastrado para esse delegatário.'); return }
        res.json(table.rows)
    })
})

app.get('/api/socios', (req, res) => {

    pool.query(socios, (err, table) => {
        if (err) res.send(err)
        else if (table.rows.length === 0) { res.send('Nenhum socios cadastrado para esse delegatário.'); return }
        res.json(table.rows)
    })
})

app.get('/api/modelosChassi', (req, res) => {
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

app.get('/api/equipamentos', (req, res) => {
    pool.query(equipamentos, (err, table) => {
        if (err) res.send(err)
        else if (table.rows && table.rows.length === 0) { res.send('Nenhum equipamento encontrado.'); return }
        res.json(table.rows)
    })
})

app.get('/api/seguros', (req, res) => {
    pool.query(seguros, (err, table) => {
        if (err) res.send(err)
        else if (table.rows && table.rows.length === 0) { res.send('Nenhum equipamento encontrado.'); return }
        res.json(table.rows)
    })
})

app.get('/api/seguradoras', (req, res) => {
    pool.query(seguradoras, (err, table) => {
        if (err) res.send(err)
        else if (table.rows && table.rows.length === 0) { res.send('Nenhum equipamento encontrado.'); return }
        res.json(table.rows);
    })
})

app.get('/api/procuracoes', (req, res) => {
    pool.query(`
            SELECT public.procuracao.*,
            d.razao_social
            FROM procuracao
            LEFT JOIN delegatario d
            ON d.delegatario_id = procuracao.delegatario_id
            ORDER BY vencimento DESC      
        `, (err, table) => {
        if (err) res.send(err)
        else if (table.rows && table.rows.length === 0) { res.send('Nenhuma procuração encontrada.'); return }
        res.json(table.rows);
    })
})

app.get('/api/procuradores', (req, res) => {
    pool.query(`
        SELECT * FROM public.procurador
        order by procurador.procurador_id desc`, (err, table) => {
        if (err) res.send(err)
        else if (table.rows && table.rows.length === 0) { res.send('Nenhum procurador encontrado.'); return }
        res.json(table.rows)
    })
})

app.post('/api/cadastroVeiculo', (req, res) => {

    const { keys, values } = parseRequestBody(req.body)

    console.log(`INSERT INTO public.veiculo (${keys}) VALUES (${values}) RETURNING *`)


    pool.query(
        `INSERT INTO public.veiculo (${keys}) VALUES (${values}) RETURNING veiculo_id`, (err, table) => {
            if (err) res.send(err)
            if (table && table.rows && table.rows.length === 0) { res.send('Nenhum veículo cadastrado para esse delegatário.'); return }

            if (table && table.rows) {
                const
                    id = table.rows[0].veiculo_id,
                    condition = `veiculo_id = '${id}'`,
                    data = getUpdatedData('veiculo', condition)

                console.log(id, condition, data)
                data.then(response => {
                    io.sockets.emit('insertVehicle', response)
                    res.send(id.toString())
                })
            }
        })
})

app.post('/api/cadEmpresa', cadEmpresa)

app.post('/api/cadSocios', cadSocios, (req, res) => {
    const { data } = req
    io.sockets.emit('insertSocios', data)
    res.send(data)
})

app.post('/api/cadProcuradores', cadProcuradores)

app.post('/api/cadProcuracao', (req, res) => {

    let parseProc = req.body.procuradores.toString()
    parseProc = '[' + parseProc + ']'
    req.body.procuradores = parseProc

    const { keys, values } = parseRequestBody(req.body)

    console.log(`INSERT INTO public.procuracao (${keys}) VALUES (${values}) RETURNING procuracao_id`)
    pool.query(
        `INSERT INTO public.procuracao (${keys}) VALUES (${values}) RETURNING procuracao_id`, (err, table) => {
            if (err) res.send(err)
            if (table && table.rows && table.rows.length === 0) { res.send('Nenhuma procuração cadastrada.'); return }
            if (table.rows.length > 0) res.json(table.rows)
            return
        });
})


app.post('/api/empresaFullCad', cadEmpresa, (req, res, next) => {
    const
        id = req.delegatario_id,
        condition = `WHERE d.delegatario_id = ${id}`,
        data = getUpdatedData('empresa', condition)
    data.then(newObject => {
        io.sockets.emit('insertEmpresa', newObject)
        console.log(condition, newObject)
        next()
    })
},
    cadSocios, (req, res) => {
        const { data } = req        
        io.sockets.emit('insertSocios', data)
        res.send(data)
    });

app.post('/api/cadSeguro', (req, res) => {
    let parsed = []

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
            if (table && table.rows.length > 0) res.send(table.rows)
        })
})

app.put('/api/updateInsurances', async (req, res) => {
    const { table, tablePK, column, value, ids } = req.body

    let
        condition = '',
        query = `
            UPDATE ${table}
            SET ${column} = '${value}' 
            WHERE `

    if (ids && ids[0]) {
        ids.forEach(id => {
            condition = condition + `${tablePK} = '${id}' OR `
        })
        condition = condition.slice(0, condition.length - 3)
        query = query + condition + ` RETURNING *`

        await pool.query(query, (err, t) => {
            if (err) console.log(err)
            if (t && t.rows) {
                const data = getUpdatedData('veiculo', condition)
                data.then(async res => {
                    await io.sockets.emit('updateVehicle', res)
                    pool.query(seguros, (err, t) => {
                        if (err) console.log(err)
                        if (t && t.rows) io.sockets.emit('updateInsurance', t.rows)
                    })
                })
            }
        })
        res.send({ ids, value })
    } else res.send('No changes whatsoever.')
})

app.put('/api/editSocios', (req, res) => {

    const { requestArray, table, tablePK, keys } = req.body
    let queryString = '',
        ids = '',
        i = 0

    keys.forEach(key => {
        requestArray.forEach(o => {
            if (o.hasOwnProperty(key)) {
                i++
                if (key !== 'socio_id' && i < 2) {
                    ids = ''
                    queryString += `
                    UPDATE ${table} 
                    SET ${key} = CASE ${tablePK} 
                    `
                    requestArray.forEach(obj => {
                        let value = obj[key]
                        if (value) {
                            if (key !== 'delegatario_id' && key !== 'share') value = '\'' + value + '\''
                            queryString += `WHEN ${obj.socio_id} THEN ${value} `

                            if (ids.split(' ').length <= requestArray.length) ids += obj.socio_id + ', '
                        }

                    })
                    ids = ids.slice(0, ids.length - 2)
                    queryString += `
                    END
                    WHERE ${tablePK} IN (${ids});
                    `
                    ids = ids + ', '
                }
            }
        })
        i = 0
    })

    pool.query(queryString, (err, t) => {
        if (err) console.log(err)
        if (t)
            pool.query(socios, (error, table) => {
                if (error) console.log(error)
                io.sockets.emit('updateSocios', table.rows)
            })
        res.send('Dados atualizados.')
    })
})


app.put('/api/editProc', (req, res) => {

    const { requestArray, table, tablePK, keys } = req.body
    let queryString = '',
        ids = '',
        i = 0

    keys.forEach(key => {
        requestArray.forEach(o => {
            if (o.hasOwnProperty(key)) {
                i++
                if (key !== 'procurador_id' && i < 2) {
                    ids = ''
                    queryString += `
                    UPDATE ${table} 
                    SET ${key} = CASE ${tablePK} 
                    `
                    requestArray.forEach(obj => {
                        let value = obj[key]
                        if (value) {
                            if (key !== 'delegatario_id') value = '\'' + value + '\''
                            if (key === 'data_fim') value += '::date'
                            queryString += `WHEN ${obj.procurador_id} THEN ${value} `

                            if (ids.split(' ').length <= requestArray.length) ids += obj.procurador_id + ', '
                        }

                    })
                    ids = ids.slice(0, ids.length - 2)
                    queryString += `
                    END
                    WHERE ${tablePK} IN (${ids});
                    `
                    ids = ids + ', '
                }
            }
        })
        i = 0
    })

    console.log(queryString)

    pool.query(queryString, (err, t) => {
        if (err) console.log(err)
        if (t) console.log(t)
        //res.send(queryString)
        res.send('Dados atualizados.')
    })
})


app.put('/api/updateVehicle', (req, res) => {

    const { requestObject, table, tablePK, id } = req.body
    let query = ''

    Object.entries(requestObject).forEach(([k, v]) => {
        query += `${k} = '${v}', `
    })

    query = `UPDATE ${table} SET ` +
        query.slice(0, query.length - 2) + ` WHERE `

    const condition = `${tablePK} = '${id}'`

    query = query + condition + ` RETURNING veiculo_id`

    pool.query(query, (err, t) => {
        if (err) console.log(err)
        if (t && t.rows) {
            const data = getUpdatedData('veiculo', condition)
            data.then(r => {
                io.sockets.emit('updateVehicle', r)
                res.send(r)
            })
        }
    })
})

app.get('/api/deleteFile/:reqId', async (req, res) => {
    const { reqId } = req.params

    const fileId = new mongoose.mongo.ObjectId(reqId)

    gfs.collection('empresaDocs')
    gfs.files.deleteOne({ _id: fileId }, (err, result) => {
        if (err) console.log(err)
        if (result) console.log(result)
    })

    empresaChunks.deleteMany({ files_id: fileId }, (err, result) => {
        if (err) console.log(err)
        if (result) {
            console.log(result)
            res.json(result)
        }
    })
})

app.delete('/api/delete', (req, res) => {
    const { table, tablePK } = req.query
    let { id } = req.query, collection = table
    if (table === 'seguro') id = '\'' + id + '\''
    if (table === 'delegatario') collection = 'empresa'
    if (table === 'procurador') collection = 'procuradore'
    if (table === 'procuracao') collection = 'procuracoe'
    if (table !== 'socios') collection = collection + 's'

    pool.query(`
    DELETE FROM public.${table} WHERE ${tablePK} = ${id}`, (err, t) => {
        if (err) console.log(err)
        if (id) {
            io.sockets.emit('deleteOne', { id: req.query.id, tablePK, collection })
            res.send(`${id} deleted from ${table}`)
        }
        else res.send('no id found.')
    })
})

app.delete('/api/removeProc', (req, res) => {

    const { delegatario_id, procurador_id } = req.body

    pool.query(`
    DELETE FROM public.procuracao    
    WHERE delegatario_id = ${delegatario_id}
    AND WHERE procurador_id = ${procurador_id}
`
    )
});


if (process.env.NODE_ENV === 'production') {
    app.get('/*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'))
    })
}

server.listen(process.env.PORT || 3001, () => {
    console.log('Running...')
})