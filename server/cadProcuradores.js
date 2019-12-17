const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadProcuradores = (req, res) => {

    const procuradores = parseRequestBody(req.body.procuradores)

    let procIds = []
    procuradores.forEach(p => {
        const { keys, values } = p
        console.log(`INSERT INTO public.procurador (${keys}) VALUES (${values})`)

        pool.query(`INSERT INTO public.procurador (${keys}) VALUES (${values}) RETURNING procurador_id`, (err, table) => {
            if (err) console.log(err)
            if (table.hasOwnProperty('rows')) {
                res.send(table.rows)
            } else {
                console.log('Nenhum procurador cadastrado.')
            }
        })
    })

    //res.send('ok')
}

module.exports = { cadProcuradores }