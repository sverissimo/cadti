//@ts-check
const
    { request, response } = require("express")
    , { getUpdatedData } = require("../getUpdatedData")


class SocioRepository {

    /**
    * Lista as entradas de uma determinada tabela
    * @param req {any} 
    * @param res {response}
    * @returns {Promise<void>}
   */
    async list(req, res) {

        try {
            let
                condition = res.locals.condition || ''
                , emps = ''
            const
                { table } = res.locals
                , { empresas, role } = req.user && req.user

            if (empresas && empresas[0] && role === 'empresa') {
                empresas.forEach(e => emps += ` or socios.empresas LIKE '%${e}%'`)
                condition += emps
            }

            const data = await getUpdatedData(table, condition || '')
            res.json(data)

        } catch (error) {
            console.log({ error: error.message })
            res.status(400).send(error)
        }
    }
}

module.exports = SocioRepository