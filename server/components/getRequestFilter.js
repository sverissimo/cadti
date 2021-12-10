const { fieldParser } = require("../utils/fieldParser")

const getRequestFilter = (req, res, next) => {

    const
        { user, url } = req
        , { role, empresas } = user

    let
        table = url.replace('/', '')
        , condition

    if (table === 'seguradoras')
        table = table.slice(0, -1)

    res.locals = {
        ...res.locals,
        condition,
        table
    }

    //Se o método não for GET, passa para o próximo router
    if (req.method !== 'GET')
        return next()

    //Se o usuário não é válido ou o role não está definido, retorna 403
    if (!user || !role)
        return res.status(403)

    //Se o usuário não possui autorização para acessar os dados de nenhuma empresa 
    if (role === 'empresa' && !empresas[0]) {
        return res.send([])
    }

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

        res.locals.condition = condition
        console.log("🚀 ~ file: getRequestFilter.js ~ line 52 ~ getRequestFilter ~ condition", condition)

        if (originalTable)
            table = originalTable
    }
    return next()
}

module.exports = getRequestFilter