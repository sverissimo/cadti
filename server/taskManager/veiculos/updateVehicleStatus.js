const
    { pool } = require('../../config/pgConfig'),
    { getUpdatedData } = require('../../getUpdatedData'),
    { laudos: laudosQuery } = require('../../queries'),
    moment = require('moment')

//Para cada veículo, pega os dados atualizados de getVehicleStatus e faz um request de atualização da situação de todos eles p o DB 
const updateVehicleStatus = async vehicleIds => {

    const
        updates = await getVehicleStatus(vehicleIds),
        ids = updates.map(obj => obj.id)
    let
        updateQuery = 'UPDATE public.veiculos SET situacao = CASE veiculo_id',
        params = ''

    if (updates && updates[0]) {

        updates.forEach(({ id, situacao }) => {
            params += ` 
            WHEN ${id} THEN '${situacao}'`
        })

        updateQuery += params + ` END
                                  WHERE veiculo_id in (${ids})`

        //const tst = updateQuery.substr(0, 500)
        console.log(updateQuery);
        await pool.query(updateQuery, (err, t) => {
            if (err)
                console.log(err)
            if (t)
                console.log('Vehicles general update result: ', t)
        })
    }
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
    console.log('task manager: ', typeof vehicleIds, vehicleIds)
    if (!vehicleIds) {
        console.log('no veic ids')
        veiculos = await getUpdatedData('veiculos')
    }
    else {
        let condition = ''
        vehicleIds.forEach(id => {
            condition = condition + `veiculos.veiculo_id = '${id}' OR `
        })
        condition = condition.slice(0, condition.length - 3)
        veiculos = await getUpdatedData('veiculos', `WHERE ${condition}`)
        console.log(condition)
    }
    if (veiculos && veiculos[0]) {
        veiculos.forEach(v => {
            //Checar validade do seguro
            const
                update = { id: v.veiculo_id },
                validDate = v.vencimento && moment(v.vencimento).isValid(),
                expired = moment(v.vencimento).isBefore(moment(), 'day'),
                noInsurance = v.apolice === 'Seguro não cadastrado'

            if ((validDate && expired) || noInsurance)
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
                update.situacao = 'Seguro vencido'

            else if (laudoVencido)
                update.situacao = 'Laudo vencido'

            else
                update.situacao = 'Ativo'

            if (v.situacao !== update.situacao)
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
        //const x = updates.slice(0, 12)

        return updates
    }
}

module.exports = updateVehicleStatus