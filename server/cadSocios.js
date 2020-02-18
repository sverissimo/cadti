const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')
const { getUpdatedData } = require('./getUpdatedData')

const cadSocios = (req, res, next) => {

    const socios = parseRequestBody(req.body.socios)
    let promisseArray = []

    socios.forEach(s => {
        const { keys, values } = s
        let sp = new Promise((resolve, reject) => {
            pool.query(`INSERT INTO public.socios (${keys}) VALUES (${values}) RETURNING socio_id`, (err, table) => {
                if (err) console.log(err)
                if (table.hasOwnProperty('rows')) {
                    resolve(table.rows)
                } else {
                    console.log('Nenhum sócio cadastrado.')
                    resolve()
                }
            })
        })
        promisseArray.push(sp)
        sp = ''
    })

    if (promisseArray.length === 0) next()
    let condition = '', ids = []
    Promise.all(promisseArray)
        .then(array => {
            if (array && array[0]) array.forEach(a => {
                ids.push(a[0].socio_id)
            })
            if (ids && ids[0]) {
                ids.forEach(id => {
                    condition = condition + `socio_id = '${id}' OR `
                })
                condition = condition.slice(0, condition.length - 3)
                condition = 'WHERE ' + condition

                const data = getUpdatedData('socio', condition)
                data.then(res => {
                    req.data = res
                    next()
                })
            }
        })
}

module.exports = { cadSocios }