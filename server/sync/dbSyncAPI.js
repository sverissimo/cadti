const tt = require('./mock_seg_data.json')
const
    express = require('express'),
    router = express.Router(),
    { pool } = require('../config/pgConfig'),
    { updateEmpresasPK } = require('./UpdateDBPrimary')
//    { getIds } = require('./getIds')


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

    //console.log(query.substring(0, 300))
    console.log(query)

    pool.query(query)
        .then(() => {
            if (table === 'empresas')
                pool.query(updateEmpresasPK)
        })
    res.send('updated alright')
})

router.get('/tst', (req, res) => {
    const tablesFrom = [{
        table: 'modelo_chassi',
        column: 'modelo_chassi',
        primaryKey: 'id',
        targetPK: 'modelo_chassi_id'
    }]

    const getIds = async (targetTable, tablesFrom) => {
        const queryTable = table => {
            pool.query(`SELECT * FROM ${table}`, (err, table) => {
                if (err) console.log(err)
                else if (table.rows && table.rows.length === 0) return
                return table.rows
            })
        }

        //tablesFrom é um objeto com cada nome de tabela do Postgresql que se vai buscar os ids para inserir na em cada linha da targetTable. Tem também o pk de cada um    

        /* tablesFrom = {
            table: 'modelo_chassi',
            column: 'modelo_chassi',
            primaryKey: 'id',
            targetPK: 'modelo_chassi_id'
        }
     */
        console.log(pool)
        const tables = () => {
            const result = {}
            tablesFrom.forEach(async ({ table }) => {
                const content = await queryTable(table)
                result[table] = content
            })
            console.log(result)
            return result
        }

        tablesFrom.forEach(({ table, primaryKey, column, targetPK }) => {
            targetTable.forEach(async obj => {

                let source = await tables(table)
                if (source) {
                    match = source.find(el => el[column] == obj[column])
                    if (match)
                        obj[targetPK] = match[primaryKey]
                }
            })
        })

        console.log(targetTable[0])
        res.send(targetTable[0])
    }

    getIds(tt, tablesFrom)

})

module.exports = router