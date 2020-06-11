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
//const { getExpired } = require('./getExpired')
//const { job } = require('./reportGenerator')
//job.start()

dotenv.config()

app.use(setCorsHeader)
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded())
app.use(express.static('client/build'))

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
        res.json({ file: filesArray });
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

//************************************ LOGS RECORDING ************************** */

app.post('/api/logs', logHandler)

app.get('/api/logs/:collection', (req, res) => {
    const
        { collection } = req.params,
        collections = { vehicleLogsModel },
        model = collections[collection]
    console.log(collection, vehicleLogsModel)

    model.find({}, (err, doc) => {
        if (err) console.log(err)
        res.send(doc)
        console.log(doc, model)
    })
})

//************************************ GET METHOD ROUTES *********************** */

const routes = 'empresas|socios|veiculos|modelosChassi|carrocerias|equipamentos|seguros|seguradoras|procuradores|procuracoes|empresasLaudo|laudos'

app.get(`/api/${routes}`, apiGetRouter)

app.get('/api/veiculo/:id', (req, res) => {
    const { id } = req.params
    const { column, filter } = req.query

    pool.query(`SELECT ${column} FROM public.veiculo WHERE ${filter} = $1`, [id], (err, table) => {
        if (err) res.send(err)
        if (table.rows.length === 0) { res.send('Veículo não encontrado.'); return }
        res.json(table.rows.map(r => r[column]))
    })
});

app.get('/api/lookUpTable/:table', lookup)

//************************************ OTHER METHOD ROUTES *********************** */

app.post('/api/cadastroVeiculo', (req, res) => {

    const { keys, values } = parseRequestBody(req.body)

    console.log(`INSERT INTO public.veiculo (${keys}) VALUES (${values}) RETURNING *`)


    pool.query(
        `INSERT INTO public.veiculo (${keys}) VALUES (${values}) RETURNING veiculo_id`, (err, table) => {
            if (err) res.send(err)
            if (table && table.rows && table.rows.length === 0) { res.send(table.rows); return }

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

app.post('/api/cadProcuradores', cadProcuradores, (req, res) => {
    const { data } = req
    io.sockets.emit('insertProcuradores', data)
    res.send(data)
})

app.post('/api/cadProcuracao', (req, res) => {

    let parseProc = req.body.procuradores.toString()
    parseProc = '[' + parseProc + ']'
    req.body.procuradores = parseProc

    const { keys, values } = parseRequestBody(req.body)

    console.log(`INSERT INTO public.procuracao (${keys}) VALUES (${values}) RETURNING procuracao_id`)
    pool.query(
        `INSERT INTO public.procuracao (${keys}) VALUES (${values}) RETURNING procuracao_id`, (err, table) => {
            if (err) res.send(err)
            if (table && table.rows && table.rows.length === 0) { res.send(table.rows); return }
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
        next()
    })
},
    cadSocios, (req, res) => {
        const { data } = req
        io.sockets.emit('insertSocios', data)
        res.send(req.delegatario_id.toString())
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
            if (table && table.rows.length > 0) res.send(table.rows)
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
            res.send(t.rows);
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
    })

    pool.query(queryString, (err, tb) => {
        if (err) console.log(err)
        pool.query(`SELECT * FROM ${table}`, (err, t) => {
            if (err) console.log(err)
            if (t && t.rows) {
                io.sockets.emit('updateElements', { collection, updatedCollection: t.rows })
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
            SELECT * FROM veiculo
            WHERE `

    if (vehicleIds && vehicleIds[0]) {
        vehicleIds.forEach(id => {
            condition = condition + `veiculo.veiculo_id = '${id}' OR `
        })
        condition = condition.slice(0, condition.length - 3)
        query = query + condition

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
        res.send(vehicleIds)
    } else res.send('No changes whatsoever.')
})

app.put('/api/changeApoliceNumber', async (req, res) => {

    const
        { id, newApoliceNumber } = req.body,
        queryString = `
        UPDATE seguro
        SET apolice = '${newApoliceNumber}'
        WHERE id = ${id};
        `

    await pool.query(queryString, (err, t) => {
        if (err) console.log(err)
        if (t && t.rows) {
            pool.query(seguros, (err, t) => {
                if (err) console.log(err)
                if (t && t.rows) io.sockets.emit('updateInsurance', t.rows)
                res.send('updated. ok.')
            })
        }
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
            condition = condition + `veiculo.${tablePK} = '${id}' OR `
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

    query = query + condition + ` RETURNING veiculo.veiculo_id`

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

app.delete('/api/delete', (req, res) => {
    const
        { table, tablePK, id } = req.query,
        { collection } = fieldParser.find(f => f.table === table),
        query = ` DELETE FROM public.${table} WHERE ${tablePK} = ${id}`

    pool.query(query, (err, t) => {
        if (err) console.log(err)
        if (id) {
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


if (process.env.NODE_ENV === 'production') {
    app.get('/*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'))
    })
}

server.listen(process.env.PORT || 3001, () => {
    console.log('Running...')
})