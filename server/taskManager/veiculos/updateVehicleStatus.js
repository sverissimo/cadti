const
    { pool } = require('../../config/pgConfig'),
    { getUpdatedData } = require('../../getUpdatedData'),
    { laudos: laudosQuery } = require('../../queries'),
    moment = require('moment')

//Para cada veículo, pega os dados atualizados de getVehicleStatus e faz um request de atualização da situação de todos eles p o DB 
const updateVehicleStatus = async (vehicleIds) => {

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

        //Monitorar o request
        const subQuery = updateQuery.substr(0, 500)
        console.log(subQuery, '***************************\n', vehicleIds)

        await pool.query(updateQuery, (err, t) => {
            if (err)
                console.log(err)
            console.log('Vehicles general update result: ok.')
        })
        console.log('updatedVehicleStatus ok.')
        return
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
        console.log("🚀 ~ file: updateVehicleStatus.js ~ line 67 ~ condition", condition)
        veiculos = await getUpdatedData('veiculos', `WHERE ${condition}`)
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
                laudoVencido = true
                laudos.forEach(l => {
                    if (l.veiculo_id === v.veiculo_id) {

                        const vencido = moment(l.validade).isBefore(moment(), 'day')
                        if (!vencido)
                            laudoVencido = false
                    }
                })
            }
            //Definir a situacao do veiculo
            if (seguroVencido && laudoVencido) {
                update.situacao = 'Ambos seguro e laudo vencidos'
            }

            else if (seguroVencido)
                update.situacao = 'Seguro vencido'

            else if (laudoVencido)
                update.situacao = 'Laudo inexistente ou vencido'

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
            c = updates.filter(u => u.situacao === 'Laudo inexistente ou vencido'),
            d = updates.filter(u => u.situacao === 'Ambos seguro e laudo vencidos')

        console.log(a.length, b.length, c.length, d.length, updates.length)
        //const x = updates.slice(0, 12)

        return updates
    }
}

module.exports = updateVehicleStatus