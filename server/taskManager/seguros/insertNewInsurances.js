const
    { pool } = require('../../config/pgConfig'),
    moment = require('moment'),
    segurosModel = require('../../mongo/models/segurosModel'),
    { seguros } = require('../../infrastructure/SQLqueries/queries'),
    updateVehicleApolice = require('../veiculos/updateVehicleApolice'),
    markAsUpdated = require('./markAsUpdated'),
    { parseRequestBody } = require('../../utils/parseRequest'),
    deleteVehiclesInsurance = require('../../deleteVehiclesInsurance')


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
            if (s && shouldUpdate && s.situacao !== 'Atualizado')
                updates.push(s)
        }
    })

    //Inserir novos seguros que passam a viger na data de hoje
    if (updates[0]) {
        updates.forEach(async seguroObj => {
            let d = new Date(seguroObj.data_emissao),
                v = new Date(seguroObj.vencimento)
            d = moment(d).format('YYYY-MM-DD')
            v = moment(v).format('YYYY-MM-DD')
            seguroObj.data_emissao = d
            seguroObj.vencimento = v
            seguroObj.situacao = 'Vigente'

            const
                { veiculos, ...insuranceUpdate } = seguroObj,
                { keys, values } = parseRequestBody(insuranceUpdate)

            //Pegar a tabela seguros do Postgresql para verificar se uma apólice com o mesmo número já existe.
            const
                s = await pool.query(seguros),
                segurosTable = s.rows,
                apoliceToUpdate = segurosTable.find(s => s.apolice === seguroObj.apolice)


            //Se já existe um seguro com o mesmo número de apólice no Postgresql, ele será substituído com os novos dados e mantendo a apólice
            if (apoliceToUpdate) {
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
                updateQuery = updateQuery + condition + ` WHERE apolice = '${apoliceToUpdate.apolice}' RETURNING apolice`

                pool.query(updateQuery, async (err, t) => {
                    if (err) console.log('Update insurance error:', err)
                    //Se o update for bem sucedido, marca no MongoDB para não atualizar mais
                    if (t && t.rows[0]) {
                        const apolice = t.rows[0].apolice
                        if (apolice) {
                            await updateVehicleApolice(veiculos, apolice)
                        }
                        markAsUpdated(apolice)

                    }
                })

                //Se o número for o mesmo, mas alguns veículos não entraram no novo seguro, atualizar situação(seg.Vencido) e apólice(SegNCadastrado)
                let vehiclesToDelete = []
                apoliceToUpdate.veiculos.forEach(v => {
                    if (!seguroObj.veiculos.includes(v))
                        vehiclesToDelete.push(v)
                })
                console.log('deleted vehicles: ', vehiclesToDelete)
                if (vehiclesToDelete[0])
                    deleteVehiclesInsurance(vehiclesToDelete)
            }

            //Se não houver nenhum seguro com esse número de apólice no Postgresql, inserir novo seguro.
            else {
                const insertQuery = `INSERT INTO public.seguros (${keys}) VALUES (${values}) RETURNING *`
                pool.query(insertQuery, async (err, t) => {
                    if (err) console.log(err)
                    if (t && t.rows[0]) {
                        const apolice = (t.rows[0].apolice)
                        if (apolice) {
                            await updateVehicleApolice(veiculos, apolice)
                            markAsUpdated(seguroObj.apolice)
                        }
                    }
                })
            }
        })
        console.log('insertNewInsurances: ok.')
        return
    }
}

module.exports = insertNewInsurances