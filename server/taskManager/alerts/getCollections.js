//@ts-check
const
    { pool } = require('../../config/pgConfig'),
    { socios: allSocios, seguros: allSeguros } = require('../../queries')


const
    seg = pool.query(allSeguros),
    soc = pool.query(allSocios),
    proc = pool.query('SELECT * FROM procuradores')

const getCollections = async query => {

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

module.exports = getCollections([seg, soc, proc])

