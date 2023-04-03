//@ts-check
const express = require('express')
const router = express.Router()
const { pool } = require('../config/pgConfig')
const { BackupDB } = require('../database/BackupDB')
const { requireAdmin } = require('../auth/checkPermissions')
const getCompartilhadoId = require('./getCompartilhadoID')
const { accessParseDB, equipamentsParseDB } = require('./getEquip')
const forceDbUpdate = require('./forceDbUpdate')
const { oldVehicles } = require('./oldVehicles')
const sendMail = require('../mail/sendMail')

router.post('/createTable', requireAdmin, (req, res) => {
    const { query } = req.body
    const backupDB = new BackupDB()
    backupDB.createSafetyBackup()
    pool.query(query).then(() => res.send('createTable alright'))
})

router.post('/updateTable', requireAdmin, (req, res) => {
    const { sgti_data, table } = req.body
    const keys = Object.keys(sgti_data[0])

    let values = ''
    sgti_data.forEach(d => {
        values += '('
        Object.values(d).forEach(v => {
            if (typeof v === 'number')
                values += `${v}, `
            else if (v === '' || v === 'NULL')
                values += `NULL, `
            else
                values += `'${v}', `
        })
        values = values.slice(0, values.length - 2)
        values += `),\n`
    })

    values = values.slice(0, values.length - 2)

    const query = `INSERT INTO public.${table} (${keys}) VALUES ${values}`

    //console.log("🚀 ~ file: dbSyncAPI.js ~ line 43 ~ router.post ~ query", query)
    //fs.writeFile(`${table}Insert.txt`, query, 'utf8', (err) => console.log(err))

    pool.query(query)
        .then(() => {
            if (table === 'veiculos')
                pool.query(getCompartilhadoId)
                    .then(() => getEquipaIds())
        })
    res.send(`${table} updated alright`)
})

router.get('/forceDbUpdate', requireAdmin, forceDbUpdate)

router.get('/createRestorePoint', requireAdmin, (req, res) => {
    const backupDB = new BackupDB()
    backupDB.createNewBackup()
    console.log('###### Postgresql: new restore point created.')
    res.status(200).send('New restore point created.')
})

router.post('/notifyError', (req, res) => {

    sendMail({ ...req.body, sendMail: true })
    res.send('wtv')
})

router.get('/restoreDB', requireAdmin, (req, res) => {
    console.log('req')
    try {
        const backupDB = new BackupDB()
        backupDB.restoreDB()
        return res.status(200).send('CadTI Database restored to the last backup')
    } catch (error) {
        console.log(error)
        res.status(error.status).send(error)
    }

})

async function getEquipaIds() {

    const
        veiculos = await pool.query('select * from veiculos ORDER BY veiculo_id ASC'),
        equipamentos = await pool.query('select * from equipamentos ORDER BY id ASC'),
        acessibilidade = await pool.query('select * from acessibilidade ORDER BY id ASC'),
        eqIds = equipamentsParseDB(veiculos.rows, equipamentos.rows),
        access = accessParseDB(veiculos.rows, acessibilidade.rows)

    let equipQuery = `
        UPDATE veiculos
        SET equipamentos_id = CASE veiculo_id
    `
    eqIds.forEach(({ v_id, ids }) => {
        ids = JSON.parse(ids)
        if (ids[0]) {
            equipQuery += `WHEN ${v_id} THEN '[${ids}]'::jsonb `
        }
    })
    equipQuery += 'END; '

    let accessQuery = `
        UPDATE veiculos
        SET acessibilidade_id = CASE veiculo_id
    `

    access.forEach(({ v_id, ids }) => {
        ids = JSON.parse(ids)
        if (ids[0]) {
            accessQuery += `WHEN ${v_id} THEN '[${ids}]'::jsonb `
        }
    })
    accessQuery += `
        END;
        ALTER TABLE veiculos
        DROP IF EXISTS equipamentos;
    `
    const updateQuery = equipQuery + accessQuery
    //fs.writeFile(`equipAccessQuery.txt`, updateQuery, 'utf8', (err) => console.log(err), (err) => console.log(err))

    pool.query(updateQuery, (err, t) => { if (err) console.log('********************Equip/AccessQuerry ERROR!!!!! ********\n\n', err) })
}

router.post('/oldVehicles', oldVehicles)

module.exports = router