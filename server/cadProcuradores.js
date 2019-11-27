const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadProcuradores = (req, res) => {

    const procuradores = parseRequestBody(req.body.procuradores)

    procuradores.forEach(p => {
        const { keys, values } = p
        pool.query(`INSERT INTO public.procurador (${keys}) VALUES (${values})`, (err, table) => {
            if (err) res.send(err)
            if (table.hasOwnProperty('rows')) {
                console.log('ok')
            } else {
                console.log('Nenhum procurador cadastrado.')
            }
        })
    })
    
    res.send(req.delegatario_id.toString())
}

module.exports = { cadProcuradores }