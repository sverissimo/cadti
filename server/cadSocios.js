const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadSocios = (req, res, next) => {

    const socios = parseRequestBody(req.body.socios)

    socios.forEach(s => {
        const { keys, values } = s
        pool.query(`INSERT INTO public.socios (${keys}) VALUES (${values}) RETURNING socio_id`, (err, table) => {
            if (err) res.send(err)
            if (table && table.rows && table.rows.length === 0) { console.log('Nenhum sócio cadastrado.') }
        })
    })
    next()
}

module.exports = { cadSocios }