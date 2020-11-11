const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadEmpresa = (req, res, next) => {
    const
        { empresa } = req.body,
        { keys, values } = parseRequestBody(empresa)

    console.log(`INSERT INTO public.empresas(${keys}) VALUES(${values}) RETURNING codigo_empresa`)

    pool.query(`INSERT INTO public.empresas(${keys}) VALUES(${values}) RETURNING empresas.codigo_empresa `, (err, table) => {
        if (err) res.send(err)
        if (table && table.rows && table.rows.length === 0) { res.send('Nenhuma empresa cadastrada.'); return }
        if (table.hasOwnProperty('rows') && table.rows.length > 0) {
            if (table && table.rows[0].hasOwnProperty('codigo_empresa')) {

                req.body.socios.forEach(obj => {
                    Object.assign(obj, { codigo_empresa: table.rows[0].codigo_empresa })
                })

                console.log(table.rows[0].codigo_empresa)
                req.codigo_empresa = table.rows[0].codigo_empresa
            }
        }
        next()
    })
}

module.exports = { cadEmpresa }