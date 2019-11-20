const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadSocios = (req, res, next) => {

    const { socios } = req.body,
        { keys, values } = parseRequestBody(socios)

    pool.query(`INSERT INTO public.socios (${keys}) VALUES (${values}) RETURNING socio_id`, (err, table) => {
        if (err) res.send(err)
        if (table && table.rows && table.rows.length === 0) { res.send('Nenhuma empresa cadastrada.'); return }        
        next()
    })
}

module.exports = { cadSocios }