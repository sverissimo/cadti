//@ts-check
const
    { request, response } = require("express")
    , { getUpdatedData } = require("../getUpdatedData")
const { Controller } = require("../controllers/Controller")


class SocioRepository extends Controller {

    /**
    * Lista as entradas de uma determinada tabela
    * @override
    * @param req {any} 
    * @param res {response}
    * @returns {Promise<void>}
   */
    list = async (req, res) => {

        try {
            let
                filter = res.locals.filter || ''
                , emps = ''
            const
                { table } = res.locals
                , { empresas, role } = req.user && req.user

            if (empresas && empresas[0] && role === 'empresa') {
                empresas.forEach(e => emps += ` or socios.empresas LIKE '%${e}%'`)
                filter += emps
            }

            const data = await getUpdatedData(table, filter || '')
            res.json(data)

        } catch (error) {
            console.log({ error: error.message })
            res.status(400).send(error)
        }
    }
}

module.exports = SocioRepository