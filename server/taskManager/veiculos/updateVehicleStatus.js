const
    { pool } = require('../../config/pgConfig'),
    { veiculos, laudos: laudosQuery } = require('../../queries'),
    moment = require('moment')

//Checa o seguro e o laudo (se for o caso) da array de ids de veículos que forem passadas ou de todos os veículos caso nenhum argumento seja passado no call
const updateVehicleStatus = async vehicles => {

    //*************************RECEBER UMA ARRAY DE VEICULOS OU DE ID DE VEICULOS E SE RECEBER IDS COMO ARGUMENTO FAZER O QUERY COMO WHERE IDS = IDS??? */
    //*************************GETUPDATED DATA DA P SÓ INSERIR A CONDIÇÃO , MAS VAI TER Q MUDAR POR CAUSA DO VEHICLEQUERY.... */

    const
        l = await pool.query(laudosQuery),
        laudos = l.rows,
        currentDate = new Date(),
        updates = []
    let
        seguroVencido,
        laudoVencido

    if (!vehicles || !vehicle.instanceof(Array)) {
        const v = await pool.query(veiculos)
        vehicles = v.rows
    }

    vehicles.forEach(v => {
        //Checar validade do seguro
        const
            update = { id: v.veiculo_id },
            validDate = v.vencimento && moment(v.vencimento).isValid(),
            expired = moment(v.vencimento).isBefore(moment(), 'day'),
            shouldUpdate = v.situacao !== 'Seguro Vencido'

        if (validDate && expired && shouldUpdate)
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
}

//Checa veículos com seguros vencidos e muda sua situação para "Seguro vencido"
const expiredVehicleInsurances = veiculos => {

    let segurosVencidos = []
    pool.query(veiculos, (err, t) => {
        if (err) console.log(err)
        if (t && t.rows) {
            segurosVencidos = t.rows.filter(r => {
                const
                    validDate = v.vencimento && moment(v.vencimento).isValid(),
                    expired = moment(v.vencimento).isBefore(moment()),
                    shouldUpdate = v.situacao !== 'Seguro Vencido'

                if (validDate && expired && shouldUpdate)
                    return r
            })
            segurosVencidos = segurosVencidos.map(s => s.veiculo_id)
            return segurosVencidos

            //Atualizar situação do veículo
            /*         segurosVencidos.forEach(id => {
                        const updateQuery = `
                                UPDATE public.veiculos
                                SET situacao = 'Seguro Vencido'
                                WHERE veiculo_id = ${id}`
        
                        pool.query(updateQuery, (err, t) => {
                            if (err) console.log(err)
                        })
                    }) */
        }
    })
}

module.exports = updateVehicleStatus