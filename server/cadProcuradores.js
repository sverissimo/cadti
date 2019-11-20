const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadProcuradores = (req, res) => {
    
    const { procuradores } = req.body,
        { keys, values } = parseRequestBody(procuradores)
    
    console.log(`INSERT INTO public.procurador (${keys}) VALUES (${values}) RETURNING procurador_id`)

    pool.query(`INSERT INTO public.procurador (${keys}) VALUES (${values}) RETURNING procurador_id`, (err, table) => {
        if (err) res.send(err)
        if (table && table.rows && table.rows.length === 0) { res.send('Nenhuma empresa cadastrada.'); return }
        if (table.rows.length > 0) {
            if (table.rows[0].hasOwnProperty('procurador_id'))
                res.json(table.rows[0].procurador_id);
        }
        return
    })
}

module.exports = { cadProcuradores }