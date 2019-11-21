const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadProcuradores = (req, res) => {

    const procuradores = parseRequestBody(req.body.procuradores)

    procuradores.forEach(p => {
        const { keys, values } = p
        console.log(`INSERT INTO public.procurador (${keys}) VALUES (${values}) RETURNING procurador_id`)
        pool.query(`INSERT INTO public.procurador (${keys}) VALUES (${values}) RETURNING procurador_id`, (err, table) => {
            if (err) res.send(err)
        })
    })
    res.send(`${procuradores.length} Procuradores cadastrados.`)
    return
}

module.exports = { cadProcuradores }