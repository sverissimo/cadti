const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')
const { getUpdatedData } = require('./getUpdatedData')

const cadProcuradores = (req, res, next) => {

    const procuradores = parseRequestBody(req.body.procuradores)

    let procIds = []
    procuradores.forEach(p => {
        const { keys, values } = p
        console.log(`INSERT INTO public.procurador (${keys}) VALUES (${values})`)

        let prom = new Promise((resolve, reject) => {
            pool.query(`INSERT INTO public.procurador (${keys}) VALUES (${values}) RETURNING procurador_id`, (err, table) => {
                if (err) console.log(err)
                if (table.hasOwnProperty('rows')) {
                    resolve(table.rows)
                } else {
                    console.log('Nenhum procurador cadastrado.')
                }
            })
        })
        procIds.push(prom)
        prom = ''
    })
    let condition = ''
    Promise.all(procIds)
        .then(ids => { if (ids && ids[0]) return ids.map(id => id[0]) })
        .then(objectsArray => {
            objectsArray.forEach(({procurador_id}) => {                
                condition = condition + `procurador_id = '${procurador_id}' OR `
            })
            condition = condition.slice(0, condition.length - 3)
            condition = 'WHERE ' + condition
            const data = getUpdatedData('procurador', condition)
            data.then(res => {
                req.data = res
                next()
            })
        })
}

module.exports = { cadProcuradores }