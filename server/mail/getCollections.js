const
    { pool } = require('../config/pgConfig'),
    { socios: allSocios, seguros: allSeguros } = require('../queries')


const
    seg = pool.query(allSeguros),
    soc = pool.query(allSocios),
    proc = pool.query('SELECT * FROM procuradores')

const getData = async query => {

    const result = {}, keys = ['seguros', 'socios', 'procuradores']
    await Promise.all(query)
        .then(r =>
            r.forEach((q, i) => {
                const key = keys[i]
                Object.assign(result, { [key]: q.rows })
            })
        )
    return result
}

/* const getData = async query => {
 
    const data = await query
    const result = data.rows
    return result
} */

/* let
seguros = seg.rows,
socios = soc.rows,
procuradores = proc.rows */

module.exports = getData([seg, soc, proc])
    //    module.exports = getData(seg)
