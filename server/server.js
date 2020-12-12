//Node modules
const
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    bodyParser = require('body-parser'),
    path = require('path'),
    fs = require('fs'),
    dotenv = require('dotenv'),
    mongoose = require('mongoose'),
    { conn } = require('./mongo/mongoConfig'),
    morgan = require('morgan'),
    xlsx = require('xlsx'),
    Grid = require('gridfs-stream')
Grid.mongo = mongoose.mongo

//Componentes do sistema
const
    counter = require('./config/counter'),
    { pool } = require('./config/pgConfig'),
    { setCorsHeader } = require('./config/setCorsHeader'),
    { apiGetRouter } = require('./apiGetRouter'),
    { storage, uploadMetadata } = require('./mongo/mongoUpload'),
    { mongoDownload, getFilesMetadata, getOneFileMetadata } = require('./mongo/mongoDownload'),
    { logHandler } = require('./logHandler'),
    { cadEmpresa } = require('./cadEmpresa'),
    { cadSocios } = require('./cadSocios'),
    { cadProcuradores } = require('./cadProcuradores'),
    { seguros, socios, laudos, lookup } = require('./queries'),
    { fieldParser } = require('./fieldParser'),
    { getUpdatedData } = require('./getUpdatedData'),
    { empresaChunks, vehicleChunks } = require('./mongo/models/chunksModel'),
    { parseRequestBody } = require('./parseRequest'),
    altContratoModel = require('./mongo/models/altContratoModel'),
    filesModel = require('./mongo/models/filesModel'),
    logsModel = require('./mongo/models/logsModel'),
    oldVehiclesModel = require('./mongo/models/oldVehiclesModel'),
    segurosModel = require('./mongo/models/segurosModel'),
    dbSync = require('./sync/dbSyncAPI'),
    dailyTasks = require('./taskManager/taskManager'),
    deleteVehiclesInsurance = require('./deleteVehiclesInsurance'),
    updateVehicleStatus = require('./taskManager/veiculos/updateVehicleStatus'),
    emitSocket = require('./emitSocket'),
    parametros = require('./parametros/parametros'),
    getFormatedDate = require('./getDate'),
    authRouter = require('./auth/authRouter')

dailyTasks.start()
dotenv.config()

app.use(morgan('dev'))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded())

app.use(express.static('client/build'))
app.use(setCorsHeader)

//**********************************    Counter ****************************/
let i = 0
app.use(counter(i))

//************************************ AUTH AND USERS  *********************** */
//app.use('/auth', authRouter)
app.use('/auth', authRouter)

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
        res.json({ file: filesArray })
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

app.get('/api/logs', (req, res) => {
    logsModel.find()
        .then(doc => res.send(doc))
        .catch(err => console.log(err))
})

app.get('/api/log', (req, res) => {
    const { subject, primaryKey, id } = req.query

    logsModel.find({ [primaryKey]: id, completed: false, subject: { $regex: subject } }, (err, doc) => {
        if (err) console.log(err)
        console.log(doc)
        if (!doc || doc.length === 0) res.send(false)
        else res.send(doc)
    })
})

//************************************CADASTRO PROVISÓRIO DE SEGUROS**************** */

app.post('/api/cadSeguroMongo', (req, res) => {
    const
        { body } = req,
        segModel = new segurosModel(body)

    segModel.save(function (err, doc) {
        if (err) console.log(err)
        if (doc) res.locals = { doc }
        res.send('saved in mongoDB')
    })
})

//***************************  CADASTRO DE ALTERAÇÕES DE CONTRATO SOCIAL**************** */

app.get('/api/altContrato', (req, res) => {
    altContratoModel.find()
        .then(doc => res.send(doc))
        .catch(err => console.log(err))
})

app.post('/api/altContrato', (req, res) => {

    const { body } = req
    const newDoc = new altContratoModel(body)
    newDoc.save((err, doc) => {
        if (err) console.log(err)
        res.json({ doc })
    })
})

//********************************** PARÂMETROS DO SISTEMA ********************************* */

app.set('io', io)
app.use('/api/parametros', parametros)

//************************************ GET METHOD ROUTES *********************** */

const routes = 'empresas|socios|veiculos|modelosChassi|carrocerias|equipamentos|seguros|seguradoras|procuradores|procuracoes|empresasLaudo|laudos|acessibilidade'

app.get(`/api/${routes}`, apiGetRouter);
app.get('/api/lookUpTable/:table', lookup);

//************************************ SPECIAL VEHICLE ROUTES *********************** */
//Busca os veículos de uma empresa incluindo todos os de outras empresas que lhe são compartilhados ou que estão em sua apolice apesar d n ser compartilhado
app.get('/api/allVehicles', async (req, res) => {
    const
        { codigoEmpresa } = req.query,
        segCondition = `WHERE seguros.codigo_empresa = ${codigoEmpresa} `,
        seguros = await getUpdatedData('seguros', segCondition) || []

    let vehicleIds = []

    //Pega todos os veículos assegurados, pertencentes ou não à frota, com compartilhamento ou não(irregulares)
    seguros.forEach(s => {
        if (s.veiculos) {
            vehicleIds.push(...s.veiculos)
        }
    })
    if (!vehicleIds[0])
        vehicleIds = 0

    const vQuery = `
    SELECT veiculos.veiculo_id, veiculos.placa, veiculos.codigo_empresa, e.razao_social as empresa, e2.razao_social as compartilhado
    FROM veiculos
    LEFT JOIN empresas e
        ON veiculos.codigo_empresa = e.codigo_empresa
    LEFT JOIN empresas e2
        ON veiculos.compartilhado_id = e2.codigo_empresa
    WHERE veiculos.codigo_empresa = ${codigoEmpresa} 
        OR veiculos.compartilhado_id = ${codigoEmpresa}
        OR veiculos.veiculo_id IN (${vehicleIds})
            `
    console.log("vQuery", vQuery)

    pool.query(vQuery, (err, t) => {
        if (err) console.log(err)
        if (t && t.rows)
            res.send(t.rows)
        else res.send([])
    })
})

//get one vehicle
app.get('/api/veiculo/:id', (req, res) => {
    const { id } = req.params
    const { column, filter } = req.query

    pool.query(`SELECT ${column} FROM public.veiculos WHERE ${filter} = $1`, [id], (err, table) => {
        if (err) res.send(err)
        if (table.rows.length === 0) { res.send('Veículo não encontrado.'); return }
        res.json(table.rows.map(r => r[column]))
    })
});

//get one dischargedVehicle
app.get('/api/getOldVehicles', async (req, res) => {
    const
        { placa } = req.query,
        query = { Placa: placa },
        result = await oldVehiclesModel.find(query).exec()
    console.log(placa)
    res.send(result)
})

//get all dischargedVehicles and download excel spreadsheet
app.get('/api/oldVehiclesXls', async (req, res) => {
    const
        dischargedVehicles = await oldVehiclesModel.find().select('-__v -_id').lean(),
        currentDate = getFormatedDate(),

        fileName = `Veículos baixados - ${currentDate}.xlsx`,

        wb = xlsx.utils.book_new(),
        wb_opts = { bookType: 'xlsx', type: 'binary' },
        ws = xlsx.utils.json_to_sheet(dischargedVehicles)

    xlsx.utils.book_append_sheet(wb, ws, 'Veículos baixados')
    xlsx.writeFile(wb, fileName, wb_opts);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

    const stream = fs.createReadStream(fileName);
    stream.on('end', () => res.end());
    stream.pipe(res)
})

//reactivate discharged vehicle status in MongoDB
app.patch('/api/reactivateVehicle', async (req, res) => {
    const
        { body } = req,
        { placa, ...update } = body,
        query = { Placa: placa }

    oldVehiclesModel.findOneAndUpdate(query, update, (err, doc) => {
        if (err)
            console.log(err)
        else
            res.send('Veículo reativado.')
    })
})

//Verifica tentativas de cadastro duplicado no DB
app.get('/api/alreadyExists', async (req, res) => {
    const
        { table, column, value } = req.query,
        query = `SELECT * FROM ${table} WHERE ${column} = '${value}'`,
        mongoQuery = { 'Placa': value }
    let
        v,
        old,
        foundOne

    //Pesquisa entre veículos ativos e baixados
    if (table === 'veiculos') {
        v = await pool.query(query)
        //Se ativo
        if (v.rows && v.rows[0]) {
            const
                { veiculo_id, placa, situacao } = v.rows[0],
                vehicleFound = { veiculoId: veiculo_id, placa, situacao }
            foundOne = { vehicleFound, status: 'existing' }
        }
        //Se baixado
        else {
            old = await oldVehiclesModel.find(mongoQuery).lean()
            console.log(old)
            if (old.length > 0)
                foundOne = { vehicleFound: old[0], status: 'discharged' }
        }

        //Retorna o veículo ou não impõe restrição
        if (foundOne)
            res.send(foundOne)
        else
            res.send(false)
    }

    //Se a tabela for outra, apenas verifica se existe conforme o critério passado pelo frontEnd
    else {
        const exists = await pool.query(query)
        if (exists.rows && exists.rows[0])
            foundOne = exists.rows[0]
        if (foundOne)
            res.send(true)
        else
            res.send(false)
    }
})

app.post('/api/baixaVeiculo', async (req, res) => {

    const discharged = new oldVehiclesModel(req.body)

    discharged.save((err, doc) => {
        if (err) console.log(err)
        if (doc) res.send(doc)
    })
})

//************************************ OTHER METHOD ROUTES *********************** */

app.post('/api/cadastroVeiculo', (req, res) => {

    const
        reqObj = req.body,
        { keys, values } = parseRequestBody(reqObj)

    console.log(`INSERT INTO public.veiculos(${keys}) VALUES(${values}) RETURNING veiculo_id`)

    pool.query(
        `INSERT INTO public.veiculos (${keys}) VALUES (${values}) RETURNING veiculo_id`, (err, table) => {

            if (err) res.send(err)
            if (table && table.rows && table.rows.length === 0) { res.send(table.rows); return }

            if (table && table.rows) {
                const
                    id = table.rows[0].veiculo_id,
                    condition = `WHERE veiculo_id = '${id}'`,
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

    pool.query(
        `INSERT INTO public.procuracoes (${keys}) VALUES (${values}) RETURNING *`, (err, table) => {
            if (err) res.send(err)
            if (table && table.rows && table.rows.length === 0) { res.send(table.rows); return }
            else if (table.rows.length > 0) {
                const updatedData = {
                    insertedObjects: table.rows,
                    collection: 'procuracoes'
                }
                io.sockets.emit('insertElements', updatedData)
                res.json(table.rows)
            }
            return
        })
})


app.post('/api/empresaFullCad', cadEmpresa, (req, res, next) => {
    const
        id = req.codigo_empresa,
        condition = `WHERE empresas.codigo_empresa = ${id}`,
        data = getUpdatedData('empresas', condition)
    data.then(newObject => {
        io.sockets.emit('insertEmpresa', newObject)
        next()
    })
},
    cadSocios, (req, res) => {
        const { data, codigo_empresa } = req
        let socioIds
        if (data && codigo_empresa) {
            socioIds = data.map(s => s.socio_id)
            io.sockets.emit('insertSocios', data)
            res.json({ socioIds, codigo_empresa })
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
    pool.query(
        `INSERT INTO public.seguros (${keys}) VALUES (${parsed}) RETURNING *`, (err, table) => {
            if (err) console.log(err)
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
            if (table !== 'laudos')
                io.sockets.emit('addElements', { insertedObjects: t.rows, table })

            else {
                //Após atualizar a tabela laudos, faze um query com join de empresas_laudo e com o resultado atualiza o socket
                pool.query(laudos, (err, t) => {
                    if (err)
                        console.log(err)
                    if (t && t.rows) {
                        io.sockets.emit('updateElements', { collection: table, updatedCollection: t.rows })
                        const { veiculo_id } = requestElement
                        if (veiculo_id)
                            updateVehicleStatus([veiculo_id], io)
                    }
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

//Edita um ou mais colunas de uma única linha da tabela
app.put('/api/editTableRow', async (req, res) => {

    const
        { id, table, updates, tablePK } = req.body,
        columns = Object.keys(updates)

    let query = `UPDATE ${table} SET `

    columns.forEach(col => {
        query += `${col} = '${updates[col]}', `
    })

    query = query.slice(0, query.length - 2)
    const condition = ` WHERE ${table}.${tablePK} = ${id} `

    query += condition

    const
        socketEvent = 'updateAny',
        pgQuery = pool.query(query)

    pgQuery
        .then(async () => {
            await emitSocket({ table, io, socketEvent, condition, primaryKey: tablePK })
            res.send(`${table} updated.`)
        })
        .catch(e => console.log(e))
})


//Atualiza um elemento da tabela 'seguros'
app.put('/api/updateInsurance', async (req, res) => {

    const { columns, updates, id, vehicleIds } = req.body

    let queryString = ''
    columns.forEach(col => {
        queryString += `
                UPDATE seguros
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
                const data = getUpdatedData('veiculos', `WHERE ${condition}`)
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

//Atualiza um ou mais elementos da tabela 'veículos
app.put('/api/updateInsurances', async (req, res) => {

    const { column, value, placas, deletedVehicles } = req.body
    let { table, ids, tablePK } = req.body

    if (!table)
        table = 'veiculos'
    if (placas) {
        tablePK = 'placa'
        ids = placas
    }

    let condition = ''

    //Se houver veículos para apagar, chamar o método para isso
    if (deletedVehicles) {
        await deleteVehiclesInsurance(deletedVehicles)

        deletedVehicles.forEach(id => {
            condition = condition + `veiculo_id = '${id}' OR `
        })
        condition = condition.slice(0, condition.length - 3)

        const data = getUpdatedData('veiculos', `WHERE ${condition}`)
        data.then(async res => {
            await io.sockets.emit('updateVehicle', res)
        })
    }

    //Se não houver nenhum id, a intenção era só apagar o n de apólice do(s) veículo(s). Nesse caso res = 'no changes'
    if (ids && ids[0]) {
        let query = `
                UPDATE ${table}
                SET ${column} = '${value}'         
                WHERE `

        condition = ''
        ids.forEach(id => {
            condition = condition + `${tablePK} = '${id}' OR `
        })

        condition = condition.slice(0, condition.length - 3)

        query = query + condition + ` RETURNING *`
        //console.log(query)
        await pool.query(query, async (err, t) => {
            if (err) console.log(err)
            if (t && t.rows) {
                updateVehicleStatus(ids, io)
                const data = getUpdatedData('veiculos', `WHERE ${condition}`)
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
    }

    else
        res.send('No changes whatsoever.')
})

app.put('/api/editSocios', (req, res) => {

    const { requestArray, table, tablePK } = req.body
    let queryString = '',
        ids = ''

    requestArray.forEach(o => {
        const keys = Object.keys(o)
        keys.forEach(key => {
            if (key !== 'socio_id') {
                ids = ''
                queryString += `
                    UPDATE ${table} 
                    SET ${key} = CASE ${tablePK} 
                    `
                requestArray.forEach(obj => {
                    let value = obj[key]
                    if (value) {
                        if (key !== 'codigo_empresa' && key !== 'share')
                            value = '\'' + value + '\''
                        queryString += `WHEN ${obj.socio_id} THEN ${value} `

                        if (ids.split(' ').length <= requestArray.length)
                            ids += obj.socio_id + ', '
                    }
                })

                ids = ids.slice(0, ids.length - 2)
                queryString += `
                    END
                    WHERE ${tablePK} IN (${ids});
                    `
                ids = ids + ', '
            }
        })
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
                            if (key !== 'codigo_empresa') value = '\'' + value + '\''
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
            let query2 = 'SELECT * FROM procuradores',
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
    if (Object.keys(requestObject).length < 1) {
        res.send('Nothing to update...')
        return
    }
    Object.entries(requestObject).forEach(([k, v]) => {
        if (k === 'equipamentos_id' || k === 'acessibilidade_id') v = `[${v}]`
        if (k === 'compartilhado_id' && v === 'NULL') query += `${k} = NULL, `
        else query += `${k} = '${v}', `
    })

    query = `UPDATE ${table} SET ` +
        query.slice(0, query.length - 2)

    const condition = ` WHERE ${tablePK} = '${id}'`

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

app.get('/api/deleteManyFiles', async (req, res) => {
    const
        { id } = req.query

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
    console.log(query, '\n\n', req.query)

    pool.query(query, async (err, t) => {
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
    const { codigo_empresa, procurador_id } = req.body

    pool.query(`
    DELETE FROM public.procuracoes    
    WHERE codigo_empresa = ${codigo_empresa}
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
})