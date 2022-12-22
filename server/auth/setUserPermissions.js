//@ts-check

const { fieldParser } = require("../utils/fieldParser")

const setUserPermissions = async (req, res, user) => {
    const { role, empresas } = user
    if (role === 'admin' || role === 'tecnico') {
        res.locals.noGetFilterRequired = true
    }

    const filter = {}
    if (role === 'empresa') {
        Object.assign(filter, {
            $or: [
                { 'empresaId': { $in: empresas } },
                { 'codigoEmpresa': { $in: empresas } }
            ]
        })
    }
    req.filter = filter

    //Se o usuário não for admin e se tiver empresas autorizadas a representar, filtra essas empresas antes de enviar dados
    if (role === 'empresa' && empresas.length) {
        let userSQLFilter
        //Verifica se a tabela necessita de filtro ou se é uma lookup table
        let table = req.path.split('/')[2]

        if (table === 'seguradoras') {
            table = table.slice(0, -1)
        }

        const shouldApplyFilter = fieldParser.find(el => el.table === table && el.codigo_empresa)

        if (shouldApplyFilter) {
            userSQLFilter = `WHERE ${table}.codigo_empresa IN (${empresas})`
        }

        res.locals = {
            ...res.locals,
            userSQLFilter,
            empresasAllowed: empresas,
        }
    }
}

module.exports = { setUserPermissions }