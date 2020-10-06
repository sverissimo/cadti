const
    { pool } = require('../config/pgConfig'),
    { veiculos, seguros } = require('../queries'),
    moment = require('moment'),
    segurosModel = require('../mongo/models/segurosModel'),
    { parseRequestBody } = require('../parseRequest')
const seg = seguros

const checkExpiredInsurances = async () => {

    //Determinar veículos com seguros vencidos
    let segurosVencidos = []
    pool.query(veiculos, (err, t) => {
        if (err) console.log(err)
        if (t && t.rows) {
            segurosVencidos = t.rows.filter(r => {
                if (r.vencimento && moment(r.vencimento).isValid()) {
                    if (moment(r.vencimento).isBefore(moment())) return r
                }
            })
            segurosVencidos = segurosVencidos.map(s => s.veiculo_id)
            console.log('Seguros vencidos:', segurosVencidos)

            //Atualizar situação do veículo
            segurosVencidos.forEach(id => {
                const updateQuery = `
            UPDATE public.veiculos
            SET situacao = 'Seguro Vencido'
            WHERE veiculo_id = ${id}
            `
                console.log(id)
                pool.query(updateQuery, (err, t) => {
                    if (err) console.log(err)
                })
            })
        }
    })
    //Determinar os seguros vencidos e atualizar seus status
    const s = await pool.query(seg)
    const segurosTable = s.rows
    let idsVencidos = []
    segurosTable.forEach(s => {
        const vencido = moment(s.vencimento).isBefore(new Date(), 'day')
        if (vencido) {
            idsVencidos.push(s.id)
        }
    })
    //console.log(idsVencidos)
    idsVencidos.forEach(id => {
        const upQuery = `
        UPDATE seguros
        SET situacao = 'Vencido'
        WHERE id = ${id}
        `
        pool.query(upQuery, (err, t) => {
            if (err) console.log(err)
            if (t && t.rows) console.log(t.rows)
        })
    })
}

//Checa todos os seguros no MongoDB e insere no Postgresql caso sua vigência tenha começado
const updateInsurances = async () => {

    let updates = []
    const seguros = await segurosModel.find().select('apolice seguradora_id codigo_empresa data_emissao vencimento situacao -_id').lean()
    seguros.forEach(s => {
        if (s.data_emissao && s.vencimento) {

            const d = s.data_emissao,
                v = s.vencimento,
                today = new Date(),
                checkEmissao = moment(d).isSameOrBefore(today, 'day'),
                checkVencimento = moment(v).isSameOrAfter(today, 'day'),
                shouldUpdate = checkEmissao && checkVencimento

            if (shouldUpdate)
                updates.push(s)
        }
    })

    //Inserir novos seguros que passam a viger na data de hoje
    if (updates[0]) {
        updates.forEach(obj => {
            let d = new Date(obj.data_emissao),
                v = new Date(obj.vencimento)
            d = d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
            v = v.toLocaleDateString() + ' ' + v.toLocaleTimeString()
            obj.data_emissao = d
            obj.vencimento = v
            obj.situacao = 'Vigente'

            const { keys, values } = parseRequestBody(obj),
                insertQuery = `
            INSERT INTO public.seguros
            (${keys}) VALUES (${values})
            RETURNING apolice
            `
            //console.log(insertQuery)
            pool.query(insertQuery, (err, t) => {
                if (err) console.log(err)
                if (t && t.rows) console.log(t.rows)
            })
        })
    }
}

module.exports = { checkExpiredInsurances, updateInsurances }