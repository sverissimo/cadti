//@ts-check
const
    { request, response } = require("express")
    , { getUpdatedData } = require("../getUpdatedData")


class ProcuradorRepository {

    async list({ empresas, role, condition }) {

        try {
            let emps = ''
            if (empresas && empresas[0] && role === 'empresa') {
                condition = `WHERE procuradores.procurador_id = 0`
                empresas.forEach(e => emps += ` or ${e} = ANY(procuradores.empresas)`)
                condition += emps
                emps = ''
            }

            const data = await getUpdatedData('procuradores', condition || '')
            return data

        } catch (error) {
            console.log({ error: error.message })
            throw new Error(error.message)
        }
    }
}

module.exports = ProcuradorRepository