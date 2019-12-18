const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadProcuradores = (req, res) => {

    const procuradores = parseRequestBody(req.body.procuradores)

    let procIds = []
    procuradores.forEach(p => {
        const { keys, values } = p
        console.log(`INSERT INTO public.procurador (${keys}) VALUES (${values})`)

        let prom = new Promise((resolve, reject) => {
            pool.query(`INSERT INTO public.procurador (${keys}) VALUES (${values}) RETURNING procurador_id`, (err, table) => {
                if (err) console.log(err)
                if (table.hasOwnProperty('rows')) {
                    resolve(table.rows)
                } else {
                    console.log('Nenhum procurador cadastrado.')
                }
            })
        })
        procIds.push(prom)
        prom = ''
    })
    Promise.all(procIds)
        .then(ids => ids.map(id => id[0]))
        .then(idArray => res.send(idArray))
}

module.exports = { cadProcuradores }