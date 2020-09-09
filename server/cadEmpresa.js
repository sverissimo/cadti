const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadEmpresa = (req, res, next) => {
    const { empresa } = req.body,
        { keys, values } = parseRequestBody(empresa)

    console.log(`INSERT INTO public.empresas(${keys}) VALUES(${values}) RETURNING delegatario_id`)

    pool.query(`INSERT INTO public.empresas(${keys}) VALUES(${values}) RETURNING empresas.delegatario_id `, (err, table) => {
        if (err) res.send(err)
        if (table && table.rows && table.rows.length === 0) { res.send('Nenhuma empresa cadastrada.'); return }
        if (table.hasOwnProperty('rows') && table.rows.length > 0) {
            if (table && table.rows[0].hasOwnProperty('delegatario_id')) {

                req.body.socios.forEach(obj => {
                    Object.assign(obj, { delegatario_id: table.rows[0].delegatario_id })
                })

                if (req.body.procuradores) req.body.procuradores.forEach(obj => {
                    Object.assign(obj, { delegatario_id: table.rows[0].delegatario_id })
                })

                console.log(table.rows[0].delegatario_id)
                req.delegatario_id = table.rows[0].delegatario_id
            }
        }
        next()
    })
}

module.exports = { cadEmpresa }