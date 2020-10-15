const
    express = require('express'),
    router = express.Router(),
    { pool } = require('../config/pgConfig'),
    { updateEmpresasPK, getVehicleFK } = require('./UpdateDBPrimary'),
    { accessParseDB, equipamentsParseDB } = require('./getEquip')


router.post('/createTable', (req, res) => {
    const { query } = req.body

    console.log(query.substring(0, 50))

    pool.query(query).then(() => res.send('createTable alright'))
})

router.post('/updateTable', (req, res) => {
    const
        { sgti_data, table } = req.body,
        keys = Object.keys(sgti_data[0])

    values = ''
    //console.log(sgti_data)
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

    //console.log(query.substring(0, 400))
    console.log(query)

    pool.query(query)
        .then(() => {
            /* if (table === 'empresas')
                pool.query(updateEmpresasPK) */
            if (table === 'veiculos')
                pool.query(getVehicleFK)
                    .then(() => getEquipaIds())
        })
    res.send('updated alright')
})

async function getEquipaIds() {

    const
        veiculos = await pool.query('select * from veiculos'),
        equipamentos = await pool.query('select * from equipamentos'),
        acessibilidade = await pool.query('select * from acessibilidade'),
        eqIds = equipamentsParseDB(veiculos.rows, equipamentos.rows),
        access = accessParseDB(veiculos.rows, acessibilidade.rows)

    let query = ` 
        UPDATE veiculos 
        SET equipamentos_id = CASE veiculo_id 
    `
    eqIds.forEach(({ v_id, ids }) => {
        ids = JSON.parse(ids)
        if (ids[0]) {
            query += `WHEN ${v_id} THEN '[${ids}]'::jsonb `
        }
    })
    query += 'END'

    pool.query(query, (err, t) => { if (err) console.log(err) })
    query = ` 
        UPDATE veiculos 
        SET acessibilidade_id = CASE veiculo_id      
    `

    access.forEach(({ v_id, ids }) => {
        ids = JSON.parse(ids)
        if (ids[0]) {
            query += `WHEN ${v_id} THEN '[${ids}]'::jsonb `
        }
    })
    query += `
        END;
        ALTER TABLE veiculos
        DROP IF EXISTS equipamentos;
    `
    pool.query(query, (err, t) => { if (err) console.log(err) })
}

module.exports = router