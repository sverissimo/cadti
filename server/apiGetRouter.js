const
    { getUpdatedData } = require('./getUpdatedData'),
    { fieldParser } = require('./utils/fieldParser')


const apiGetRouter = (req, res) => {
    const
        { user } = req,
        { role, empresas } = user
    let
        table = req.url.replace('/api/', ''),
        condition,
        data,
        emps

    if (table === 'seguradoras') table = table.slice(0, -1)
    //Se o usuário não é válido ou o role não está definido, retorna 403
    if (!user || !role)
        return res.status(403)

    //Se o usuário não possui autorização para acessar os dados de nenhuma empresa 
    if (role === 'empresa' && !empresas[0])
        return res.send([])

    //Se o usuário não for admin e se tiver empresas autorizadas a representar, filtra essas empresas antes de enviar dados
    if (role === 'empresa' && empresas[0]) {
        //Se a tabela for allVehicleFields, muda p/ fazer o filtro depois volta para o request do getUpdatedData
        let originalTable
        if (table === 'allVehicleFields') {
            originalTable = 'allVehicleFields'
            table = 'veiculos'
        }
        //Verifica se a tabela necessita de filtro ou se é uma lookup table
        const applyFilter = fieldParser.find(el => el.table === table && el.codigo_empresa)
        if (applyFilter)
            condition = `WHERE ${table}.codigo_empresa IN (${empresas})`
        //As tabelas socios e procuradores não possuem código_empresa, mas arrays de empresas
        if (table === 'socios') {
            emps = ''
            empresas.forEach(e => emps += ` or socios.empresas LIKE '%${e}%'`)
            condition += emps
        }
        if (table === 'procuradores') {
            condition = `WHERE procuradores.procurador_id = 0`
            emps = ''
            empresas.forEach(e => emps += ` or ${e} = ANY(procuradores.empresas)`)
            condition += emps
        }

        if (originalTable)
            table = originalTable
    }

    //console.log(condition)
    data = getUpdatedData(table, condition || '')
    data
        .then(r => res.json(r))
        .catch(err => console.log(err))
}

module.exports = { apiGetRouter }