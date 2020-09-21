//const { pool } = require('../config/pgConfig')
const tt = require('./mock_seg_data.json')

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
        targetTable.forEach(obj => {

            const source = tables(table)
            if (source) {
                match = source.find(el => el[column] == obj[column])
                if (match)
                    obj[targetPK] = match[primaryKey]
            }
        })
    })

    console.log(targetTable[0])
}

getIds(tt, tablesFrom)

module.exports = { getIds }