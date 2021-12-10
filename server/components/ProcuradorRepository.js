//@ts-check
const
    { request, response } = require("express")
    , { getUpdatedData } = require("../getUpdatedData")


class ProcuradorRepository {

    /**
    * Lista as entradas de uma determinada tabela
    * @param req {any} 
    * @param res {response}
    * @returns {Promise<void>}
   */
    async list(req, res) {

        try {
            let
                { condition } = res.locals
                , emps = ''
            const
                { table } = res.locals
                , { empresas } = req.user && req.user

            if (empresas && empresas[0]) {
                console.log("🚀 ~ file: ProcuradorRepository.js ~ line 26 ~ ProcuradorRepository ~ list ~ empresas", empresas)
                condition = `WHERE procuradores.procurador_id = 0`
                emps = ''
                empresas.forEach(e => emps += ` or ${e} = ANY(procuradores.empresas)`)
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

module.exports = ProcuradorRepository