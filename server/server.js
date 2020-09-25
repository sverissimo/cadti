const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)
const bodyParser = require('body-parser')
const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const { conn } = require('./mongo/mongoConfig')
const Grid = require('gridfs-stream')
Grid.mongo = mongoose.mongo
const morgan = require('morgan')

const { pool } = require('./config/pgConfig')
const { setCorsHeader } = require('./config/setCorsHeader')
const { apiGetRouter } = require('./apiGetRouter')

const { storage, uploadMetadata } = require('./mongo/mongoUpload')
const { mongoDownload, getFilesMetadata, getOneFileMetadata } = require('./mongo/mongoDownload')
const { logHandler } = require('./logHandler')

const { cadEmpresa } = require('./cadEmpresa')
const { cadSocios } = require('./cadSocios')
const { cadProcuradores } = require('./cadProcuradores')

const { seguros, socios, laudos, lookup } = require('./queries')

const { fieldParser } = require('./fieldParser')
const { getUpdatedData } = require('./getUpdatedData')
const { empresaChunks, vehicleChunks } = require('./mongo/models/chunksModel')
const { vehicleLogsModel } = require('./mongo/models/vehicleLogsModel')

const { uploadFS } = require('./upload')
const { parseRequestBody } = require('./parseRequest')
const filesModel = require('./mongo/models/filesModel')

const dbSync = require('./sync/dbSyncAPI')
/* const { filesModel } = require('./mongo/models/filesModel')
const { empresaModel } = require('./mongo/models/empresaModel')
 */
//const { getExpired } = require('./getExpired')
//const { job } = require('./reportGenerator')
//job.start()

dotenv.config()

app.use(morgan('dev'))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded())



app.use(express.static('client/build'))
app.use(setCorsHeader)
//app.get('/tst', getExpired)

//************************************ BINARY DATA *********************** */

let gfs
conn.on('error', console.error.bind(console, 'connection error:'))
conn.once('open', () => {
    gfs = Grid(conn.db)
    gfs.collection('vehicleDocs')
    console.log('Mongo connected to the server.')
})

const { vehicleUpload, empresaUpload } = storage()

app.post('/api/empresaUpload', empresaUpload.any(), uploadMetadata, (req, res) => {
    const { filesArray } = req
    if (filesArray && filesArray[0]) {
        io.sockets.emit('insertFiles', { insertedObjects: filesArray, collection: 'empresaDocs' })
        res.json({ file: filesArray })
    } else res.send('No uploads whatsoever...')
})

app.post('/api/vehicleUpload', vehicleUpload.any(), uploadMetadata, (req, res) => {
    const { filesArray } = req
    if (filesArray && filesArray[0]) {
        io.sockets.emit('insertFiles', { insertedObjects: filesArray, collection: 'vehicleDocs' })
        res.json({ file: filesArray });
    } else res.send('No uploads whatsoever...')
})

app.get('/api/mongoDownload/', (req, res) => mongoDownload(req, res, gfs))

app.get('/api/getFiles/:collection', (req, res) => getFilesMetadata(req, res, gfs))

app.get('/api/getOneFile/', getOneFileMetadata)

app.put('/api/updateFilesMetadata', async (req, res) => {

    const
        { collection, ids, metadata } = req.body,
        update = {}

    if (!ids) {
        res.send('no file sent to the server')
        return
    }

    Object.entries(metadata).forEach(([k, v]) => {
        update['metadata.' + k] = v
    })

    console.log('this is the  metadata: ', metadata, '\n\nAnd this is the update: ', update)

    parsedIds = ids.map(id => new mongoose.mongo.ObjectId(id))

    gfs.collection(collection)

    gfs.files.updateMany(
        { "_id": { $in: parsedIds } },
        { $set: { ...update } },

        async (err, doc) => {
            if (err) console.log(err)
            if (doc) {
                const data = {
                    collection,
                    metadata,
                    ids,
                    primaryKey: 'id'
                }
                io.sockets.emit('updateDocs', data)
                res.send({ doc, ids })
                return
            }
        }
    )
})

//************************************ LOGS RECORDING ************************** */

app.post('/api/logs', logHandler, (req, res) => {
    const
        { collection } = req.body,
        { id, doc } = res.locals,
        insertedObjects = [doc],
        insertResponseObj = { insertedObjects, collection }

    if (!id) io.sockets.emit('insertElements', insertResponseObj)
    else io.sockets.emit('updateLogs', insertedObjects)
    res.sendStatus(200)
})

app.get('/api/logs/:collection', (req, res) => {
    const
        { collection } = req.params,
        collectionModels = { vehicleLogs: vehicleLogsModel },
        model = collectionModels[collection]

    let oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    let query = { $or: [{ completed: false }, { completed: true, updatedAt: { $gte: oneYearAgo } }] }

    model.find(query)
        .then(doc => res.send(doc))
        .catch(err => console.log(err))
})

app.get('/api/log', (req, res) => {
    const
        { collection, subject, primaryKey, id } = req.query,
        collectionModels = { vehicleLogs: vehicleLogsModel },
        model = collectionModels[collection]
    console.log(subject, typeof subject)
    model.find({ [primaryKey]: id, completed: false, subject: { $regex: subject } }, (err, doc) => {
        if (err) console.log(err)
        console.log(doc)
        if (!doc || doc.length === 0) res.send(false)
        else res.send(doc)
    })
})

//************************************ GET METHOD ROUTES *********************** */

const routes = 'empresas|socios|veiculos|modelosChassi|carrocerias|equipamentos|seguros|seguradoras|procuradores|procuracoes|empresasLaudo|laudos|acessibilidade'

app.get(`/api/${routes}`, apiGetRouter);

app.get('/api/veiculo/:id', (req, res) => {
    const { id } = req.params
    const { column, filter } = req.query

    pool.query(`SELECT ${column} FROM public.veiculos WHERE ${filter} = $1`, [id], (err, table) => {
        if (err) res.send(err)
        if (table.rows.length === 0) { res.send('Veículo não encontrado.'); return }
        res.json(table.rows.map(r => r[column]))
    })
});

app.get('/api/lookUpTable/:table', lookup)

//************************************ OTHER METHOD ROUTES *********************** */

app.post('/api/cadastroVeiculo', (req, res) => {

    const
        reqObj = req.body,
        { keys, values } = parseRequestBody(reqObj)

    console.log(`INSERT INTO public.veiculos (${keys}) VALUES (${values}) RETURNING *`)

    pool.query(
        `INSERT INTO public.veiculos (${keys}) VALUES (${values}) RETURNING veiculo_id`, (err, table) => {
            if (err) res.send(err)
            if (table && table.rows && table.rows.length === 0) { res.send(table.rows); return }

            if (table && table.rows) {
                const
                    id = table.rows[0].veiculo_id,
                    condition = `veiculo_id = '${id}'`,
                    data = getUpdatedData('veiculos', condition)

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

app.post('/api/cadProcuradores', cadProcuradores, (req, res) => {
    const { data } = req
    console.log(data)
    io.sockets.emit('insertProcuradores', data)
    res.send(data)
})

app.post('/api/cadProcuracao', (req, res) => {

    let parseProc = req.body.procuradores.toString()
    parseProc = '[' + parseProc + ']'
    req.body.procuradores = parseProc

    const { keys, values } = parseRequestBody(req.body)

    console.log(`INSERT INTO public.procuracao (${keys}) VALUES (${values}) RETURNING *`)
    pool.query(
        `INSERT INTO public.procuracao (${keys}) VALUES (${values}) RETURNING *`, (err, table) => {
            if (err) res.send(err)
            if (table && table.rows && table.rows.length === 0) { res.send(table.rows); return }
            if (table.rows.length > 0) {
                const updatedData = {
                    insertedObjects: table.rows,
                    collection: 'procuracoes'
                }
                io.sockets.emit('insertElements', updatedData)
                res.json(table.rows)
            }
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
        next()
    })
},
    cadSocios, (req, res) => {
        const { data, delegatario_id } = req
        let socioIds
        if (data && delegatario_id) {
            socioIds = data.map(s => s.socio_id)
            io.sockets.emit('insertSocios', data)
            res.json({ socioIds, delegatario_id })
        }
        else res.send('No socio added whatsoever.')
    })

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
            if (table && table.rows && table.rows.length === 0) { res.send(table.rows); return }
            if (table && table.rows.length > 0) {
                const updatedData = {
                    insertedObjects: table.rows,
                    collection: 'seguros'
                }
                io.sockets.emit('insertElements', updatedData)
                res.send(table.rows)
            }
        })
})

app.post('/api/addElement', (req, res) => {
    const
        { table, requestElement } = req.body,
        { keys, values } = parseRequestBody(requestElement)

    let queryString = `INSERT INTO public.${table} (${keys}) VALUES (${values}) RETURNING *`

    pool.query(queryString, (err, t) => {
        if (err) console.log(err)

        if (t && t.rows) {
            if (table !== 'laudos') io.sockets.emit('addElements', { insertedObjects: t.rows, table })
            else {
                pool.query(laudos, (err, t) => {
                    if (err) console.log(err)
                    if (t && t.rows) io.sockets.emit('updateElements', { collection: table, updatedCollection: t.rows })
                })
            }
            res.json(t.rows)
        }
    })
})

app.put('/api/editElements', (req, res) => {
    const
        { table, tablePK, column, requestArray } = req.body,
        { collection } = fieldParser.find(el => el.table === table)
    let
        queryString = ''
    if (!requestArray && !requestArray[0]) {
        res.send('nothing to update...')
        return
    }

    requestArray.forEach(obj => {
        queryString += `
            UPDATE ${table}
            SET ${column} = '${obj[column]}' 
            WHERE ${tablePK} = ${obj.id};             
            `
    });
    const obj = requestArray[0]
    pool.query(queryString, (err, tb) => {
        if (err) console.log(err)
        pool.query(`SELECT * FROM ${table} WHERE ${tablePK} = ${obj.id}`, (err, t) => {
            if (err) console.log(err)
            if (t && t.rows) {
                io.sockets.emit('updateAny', { collection, updatedObjects: t.rows, primaryKey: 'id' })
                res.send(t.rows)
            } else res.send('Nothing was returned from the dataBase...')
        })
    })
})

app.put('/api/updateInsurance', async (req, res) => {

    const { columns, updates, id, vehicleIds } = req.body

    let queryString = ''
    columns.forEach(col => {
        queryString += `
                UPDATE seguro
                SET ${col} = '${updates[col]}'
                WHERE id = ${id};
        `
    })

    await pool.query(queryString, (err, t) => {
        if (err) console.log(err)
        pool.query(seguros, (err, t) => {
            if (err) console.log(err)
            if (t && t.rows) io.sockets.emit('updateInsurance', t.rows)
        })
    })

    let
        condition = '',
        query = `
            SELECT * FROM veiculos
            WHERE `

    if (vehicleIds && vehicleIds[0]) {
        vehicleIds.forEach(id => {
            condition = condition + `veiculos.veiculo_id = '${id}' OR `
        })
        condition = condition.slice(0, condition.length - 3)
        query = query + condition

        await pool.query(query, (err, t) => {
            if (err) console.log(err)
            if (t && t.rows) {
                const data = getUpdatedData('veiculos', condition)
                data.then(async res => {
                    await io.sockets.emit('updateVehicle', res)
                    pool.query(seguros, (err, t) => {
                        if (err) console.log(err)
                        if (t && t.rows) io.sockets.emit('updateInsurance', t.rows)
                    })
                })
            }
        })
        res.send(vehicleIds)
    } else res.send('No changes whatsoever.')
})

app.put('/api/updateInsurances', async (req, res) => {
    const { table, column, value, placas } = req.body
    let { ids, tablePK } = req.body

    if (placas) {
        tablePK = 'placa'
        ids = placas
    }

    let
        condition = '',
        query = `
            UPDATE ${table}
            SET ${column} = '${value}' 
            WHERE `

    if (ids && ids[0]) {
        ids.forEach(id => {
            condition = condition + `veiculos.${tablePK} = '${id}' OR `
        })
        condition = condition.slice(0, condition.length - 3)
        query = query + condition + ` RETURNING *`

        await pool.query(query, (err, t) => {
            if (err) console.log(err)
            if (t && t.rows) {
                const data = getUpdatedData('veiculos', condition)
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

    pool.query(queryString, (err, t) => {
        if (err) console.log(err)
        if (t) {
            const ids = requestArray.map(el => el.procurador_id)
            let query2 = 'SELECT * FROM procurador',
                condition = ` WHERE procurador_id = ${ids[0]}`

            ids.forEach((id, i) => {
                if (i > 0)
                    condition += ` OR procurador_id = ${id}`
            })
            query2 += condition

            pool.query(query2, (error, table) => {
                if (error) console.log(error)
                const update = { data: table.rows, collection: 'procuradores', primaryKey: 'procuradorId' }
                console.log(update)
                io.sockets.emit('updateProcuradores', update)
                res.send('Dados atualizados.')
            })
        }
        else res.send('something went wrong with your update...')
    })
})

app.put('/api/updateVehicle', (req, res) => {

    const { requestObject, table, tablePK, id } = req.body
    let query = ''
    console.log(requestObject)
    Object.entries(requestObject).forEach(([k, v]) => {
        if (k === 'equipamentos_id' || k === 'acessibilidade_id') v = `[${v}]`
        if (k === 'compartilhado_id' && v === 'NULL') query += `${k} = NULL, `
        else query += `${k} = '${v}', `
    })

    query = `UPDATE ${table} SET ` +
        query.slice(0, query.length - 2) + ` WHERE `

    const condition = `${tablePK} = '${id}'`

    query = query + condition + ` RETURNING veiculos.veiculo_id`
    console.log(query)
    pool.query(query, (err, t) => {
        if (err) console.log(err)
        if (t && t.rows) {
            const data = getUpdatedData('veiculos', condition)
            data.then(r => {
                io.sockets.emit('updateVehicle', r)
                res.send(r)
            })
        }
    })
});

app.delete('/api/deleteFile', async (req, res) => {
    const
        { id, collection } = req.query,
        fileId = new mongoose.mongo.ObjectId(id)

    let chunks
    gfs.collection(collection)

    gfs.files.deleteOne({ _id: fileId }, (err, result) => {
        if (err) console.log(err)
        if (result) console.log(result)
    })

    if (collection === 'empresaDocs') chunks = empresaChunks
    if (collection === 'vehicleDocs') chunks = vehicleChunks

    chunks.deleteMany({ files_id: fileId }, (err, result) => {
        if (err) console.log(err)
        if (result) {
            console.log(result)
            res.json(result)
        }
    })
    io.sockets.emit('deleteOne', { tablePK: '_id', id, collection })
})

app.get('/api/deleteManyFiles', async (req, res) => {
    const
        { id, collection } = req.query

    console.log(id, typeof id)
    const docsTodelete = { 'metadata.veiculoId': id }

    gfs.collection('vehicleDocs')

    const getIds = await filesModel.filesModel.find(docsTodelete).select('_ids')

    const ids = getIds.map(e => new mongoose.mongo.ObjectId(e._id))

    let chunks
    gfs.collection('vehicleDocs')
    let r
    ids.forEach(fileId => {
        gfs.files.deleteOne({ _id: fileId }, (err, result) => {
            if (err) console.log(err)
            if (result) { r = result; console.log(r) }
        })

        //        if (collection === 'empresaDocs') chunks = empresaChunks
        //      if (collection === 'vehicleDocs') chunks = vehicleChunks

        vehicleChunks.deleteMany({ files_id: fileId }, (err, result) => {
            if (err) console.log(err)
            if (result) {
                console.log('result aaaaaaaaaaaaaaaaaaaa')
            }
        })
    })
    res.send(r || 'hi, im elfo')
    //    io.sockets.emit('deleteOne', { tablePK: '_id', id, collection })
})

app.delete('/api/delete', (req, res) => {

    let { id } = req.query
    const
        { table, tablePK } = req.query,
        { collection } = fieldParser.find(f => f.table === table)

    if (collection === 'laudos')
        id = `'${id}'`

    const query = ` DELETE FROM public.${table} WHERE ${tablePK} = ${id}`


    console.log(query)
    pool.query(query, (err, t) => {
        if (err) console.log(err)
        if (id) {
            id = id.replace(/\'/g, '')
            io.sockets.emit('deleteOne', { id, tablePK, collection })
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
})

app.use('/sync', dbSync)

if (process.env.NODE_ENV === 'production') {
    app.get('/*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'))
    })
}

//**********************************ERROR HANDLIONG*********************** */
app.use((req, res, next) => {
    const error = new Error("Not found.");
    error.status = 404
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);

    const
        { message, name } = error,
        errorLines = error.stack.split('\n')

    console.log(
        '\n******************' +
        '\nError name: ' + name +
        '\nError message: ' + message +
        '\nError line: ' + errorLines[1] +
        //      '\nError line2: ' + errorLines[2] +
        '\n*********************\n'
    )

    res.json({
        errorStatus: error.status || 500,
        errorMessage: message,
    });
});

server.listen(process.env.PORT || 3001, () => {
    console.log('Running...')
})