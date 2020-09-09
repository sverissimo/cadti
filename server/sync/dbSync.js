const
    express = require('express'),
    router = express.Router(),
    { pool } = require('../config/pgConfig'),
    { updateEmpresasPK } = require('./UpdateDBPrimary')


router.post('/createTable', (req, res) => {
    const { query } = req.body

    console.log(query.substring(0, 50))

    pool.query(query).then(() => res.send('alright'))
})

router.post('/updateTable', (req, res) => {
    const
        { sgti_data } = req.body,
        keys = Object.keys(sgti_data[0])

    values = ''
    console.log(sgti_data)
    sgti_data.forEach(d => {
        values += '('
        Object.values(d).forEach(v => {
            if (typeof v === 'number')
                values += `${v}, `
            else if (v === '')
                values += `NULL, `
            else
                values += `'${v}', `
        })
        values = values.slice(0, values.length - 2)
        values += `),\n`
    })

    values = values.slice(0, values.length - 2)

    const query = `INSERT INTO public.empresas (${keys}) VALUES ${values}`

    console.log(query.substring(0, 50))

    pool.query(query)
        .then(() => pool.query(updateEmpresasPK))
    res.send('alright')
})


module.exports = router