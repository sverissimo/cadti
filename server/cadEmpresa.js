const
    { pool } = require('./config/pgConfig'),
    { parseRequestBody } = require('./utils/parseRequest')

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

                const codigoEmpresa = table.rows[0].codigo_empresa
                res.locals.codigoEmpresa = codigoEmpresa
                //console.log("🚀 ~ file: cadEmpresa.js ~ line 33 ~ pool.query ~ res.locals", res.locals)

                //Se não tiver sócios no body, next()
                if (!req.body.socios) {
                    return next()
                }

                //Insere a coluna empresas [{codigoEmpresa, share}] para cada sócio
                req.body.socios.forEach(obj => {
                    //Os sócios podem já ter cadastro no sistema (outra empresa) ou ser novos
                    let { empresas, share } = obj
                    if (empresas && empresas instanceof Array)
                        empresas.push({ codigoEmpresa, share })
                    //Os novos não vêm com a coluna 'empresas' do frontEnd (req.body)
                    else
                        empresas = [{ codigoEmpresa, share }]

                    obj.empresas = JSON.stringify(empresas)

                })
                next()
            }
        }
    })
}

module.exports = { cadEmpresa }