const
    moment = require('moment'),
    segurosModel = require('../../mongo/models/segurosModel'),
    newVehicleInsurances = require('../veiculos/newVehicleInsurances'),
    markAsUpdated = require('./markAsUpdated'),
    { parseRequestBody } = require('../../parseRequest')

//Checa todos os seguros no MongoDB e insere no Postgresql caso sua vigência tenha começado
const insertNewInsurances = async () => {

    let updates = []
    const segurosCollection = await segurosModel.find().select('veiculos apolice seguradora_id codigo_empresa data_emissao vencimento situacao -_id').lean()

    //Checa se as datas de vigência e vencimento são antes ou depois do dia atual
    segurosCollection.forEach(s => {
        if (s.data_emissao && s.vencimento) {
            const d = s.data_emissao,
                v = s.vencimento,
                today = new Date(),
                checkEmissao = moment(d).isSameOrBefore(today, 'day'),
                checkVencimento = moment(v).isSameOrAfter(today, 'day'),
                shouldUpdate = checkEmissao && checkVencimento
            //Não inserir seguros que já foram inseridos no Postgresql (situacao === 'Atualizado')
            if (shouldUpdate && s.situacao !== 'Atualizado')
                updates.push(s)
        }
    })

    //Inserir novos seguros que passam a viger na data de hoje
    if (updates[0]) {
        updates.forEach(async obj => {
            let d = new Date(obj.data_emissao),
                v = new Date(obj.vencimento)
            d = d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
            v = v.toLocaleDateString() + ' ' + v.toLocaleTimeString()
            obj.data_emissao = d
            obj.vencimento = v
            obj.situacao = 'Vigente'

            const
                { veiculos, ...insuranceUpdate } = obj,
                { keys, values } = parseRequestBody(insuranceUpdate)

            //Pegar a tabela seguros do Postgresql para verificar se uma apólice com o mesmo número já existe. 
            const
                s = await pool.query(seg),
                segurosTable = s.rows,
                updateApolice = segurosTable.find(s => s.apolice === obj.apolice)

            //Se já existe um seguro com o mesmo número de apólice no Postgresql, ele será substituído com os novos dados e mantendo a apólice 
            if (updateApolice) {
                const
                    keysArray = keys.split(','),
                    valuesArray = values.split(',')
                let
                    updateQuery = `UPDATE public.seguros SET`,
                    condition = ''

                keysArray.forEach((k, i) => {
                    if (k !== 'apolice')
                        condition += `
                        ${k} = ${valuesArray[i]}, `
                })
                condition = condition.substring(0, condition.length - 2)
                updateQuery = updateQuery + condition + ` WHERE apolice = '${updateApolice.apolice}' RETURNING apolice`

                pool.query(updateQuery, (err, t) => {
                    if (err) console.log('Update insurance error:', err)
                    //Se o update for bem sucedido, marca no MongoDB para não atualizar mais
                    if (t && t.rows[0]) {
                        const apolice = t.rows[0].apolice
                        if (apolice)
                            markAsUpdated(apolice)
                    }
                })
            }
            //Se não houver nenhum seguro com esse número de apólice no Postgresql, inserir novo seguro.
            else {
                const insertQuery = `INSERT INTO public.seguros (${keys}) VALUES (${values}) RETURNING *`
                pool.query(insertQuery, (err, t) => {
                    if (err) console.log(err)
                    if (t && t.rows[0]) {
                        const apolice = (t.rows[0].apolice)
                        if (apolice) {
                            newVehicleInsurances(veiculos, apolice)
                            markAsUpdated(obj.apolice)
                        }
                    }
                })
            }
        })
    }
}

module.exports = insertNewInsurances