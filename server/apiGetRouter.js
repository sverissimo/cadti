const
    { getUpdatedData } = require('./getUpdatedData'),
    { fieldParser } = require('./fieldParser')


const apiGetRouter = (req, res) => {
    const
        { user } = req,
        { role, empresas } = user
    let
        table = req.url.replace('/api/', ''),
        condition
    if (table === 'seguradoras') table = table.slice(0, -1)
    //Se o usuário não é válido ou o role não está definido, retorna 403
    if (!user || !role)
        return res.status(403)

    //Se o usuário não for admin e se tiver empresas autorizadas a representar, filtra essas empresas antes de enviar dados
    if (role !== 'admin' && empresas[0]) {
        //Verifica se a tabela necessita de filtro ou se é uma lookup table
        const applyFilter = fieldParser.find(el => el.table === table && el.codigo_empresa)

        if (applyFilter) {
            primaryKey = applyFilter.column
            condition = `WHERE ${table}.codigo_empresa IN (${empresas})`
            console.log(primaryKey, condition, table)
        }
    }
    const data = getUpdatedData(table, condition || '')
    data
        .then(r => res.json(r))
        .catch(err => console.log(err))
}

module.exports = { apiGetRouter }