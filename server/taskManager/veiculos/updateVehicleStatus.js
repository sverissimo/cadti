const
    { pool } = require('../../config/pgConfig'),
    { getUpdatedData } = require('../../getUpdatedData'),
    { laudos: laudosQuery } = require('../../queries'),
    moment = require('moment')

const updateVehicleStatus = async vehicleIds => {

    const updates = await getVehicleStatus(vehicleIds)
    let
        updateQuery = 'UPDATE public.veiculos SET situacao = CASE veiculo_id',
        params = ''

    updates.forEach(({ id, situacao }) => {
        params += ` 
        WHEN ${id} THEN '${situacao}'`
    })
    updateQuery += params + 'END'
    console.log(updateQuery.substr(0, 800))
    pool.query(updateQuery, (err, t) => {
        if (err)
            console.log(err)
        if (t)
            console.log(t)
    })
}

//Checa o seguro e o laudo (se for o caso) da array de ids de veículos que forem passadas ou de todos os veículos caso nenhuma array de veiculo_ids seja passado
const getVehicleStatus = async vehicleIds => {

    const
        l = await pool.query(laudosQuery),
        laudos = l.rows,
        currentDate = new Date(),
        updates = []
    let
        veiculos,
        seguroVencido,
        laudoVencido

    if (!vehicleIds || !vehicleIds.instanceof(Array))
        veiculos = await getUpdatedData('veiculos')

    else {
        let condition = ''
        vehicleIds.forEach(id => {
            condition = condition + `veiculos.veiculo_id = '${id}' OR `
        })
        condition = condition.slice(0, condition.length - 3)
        veiculos = await getUpdatedData('veiculos', `WHERE ${condition}`)
    }

    veiculos.forEach(v => {
        //Checar validade do seguro
        const
            update = { id: v.veiculo_id },
            validDate = v.vencimento && moment(v.vencimento).isValid(),
            expired = moment(v.vencimento).isBefore(moment(), 'day')

        if (validDate && expired)
            seguroVencido = true

        //Checar laudos vencidos
        const currentYear = currentDate.getFullYear()
        if (currentYear - v.ano_carroceria >= 15) {

            laudos.forEach(l => {
                if (l.veiculo_id === v.veiculo_id) {
                    const vencido = moment(l.validade).isBefore(currentDate, 'day')
                    if (vencido)
                        laudoVencido = true
                }
            })
        }
        //Definir a situacao do veiculo
        if (seguroVencido && laudoVencido)
            update.situacao = 'Seguro e laudo vencidos'

        else if (seguroVencido)
            update.situacao = 'Seguro Vencido'

        else if (laudoVencido)
            update.situacao = 'Laudo Vencido'

        else
            update.situacao = 'Ativo'

        updates.push(update)

        laudoVencido = undefined
        seguroVencido = undefined
    })


    const
        a = updates.filter(u => u.situacao === 'Ativo'),
        b = updates.filter(u => u.situacao === 'Seguro Vencido'),
        c = updates.filter(u => u.situacao === 'Laudo Vencido'),
        d = updates.filter(u => u.situacao === 'Seguro e laudo vencidos')

    console.log(a.length, b.length, c.length, d.length, updates.length)
    const x = updates.slice(0, 12)

    return updates
}



module.exports = updateVehicleStatus