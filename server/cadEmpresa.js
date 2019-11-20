const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadEmpresa = (req, res, next) => {
    const { empresa } = req.body,
        { keys, values } = parseRequestBody(empresa)

    pool.query(`INSERT INTO public.delegatario(${keys}) VALUES(${values}) RETURNING delegatario_id `, (err, table) => {
        if (err) res.send(err)
        if (table && table.rows && table.rows.length === 0) { res.send('Nenhuma empresa cadastrada.'); return }
        if (table.rows.length > 0) {
            if (table.rows[0].hasOwnProperty('delegatario_id'))
                req.body.socios.delegatario_id = table.rows[0].delegatario_id
                req.body.procuradores.delegatario_id = table.rows[0].delegatario_id
        }
        next()
    })
}

module.exports = { cadEmpresa }