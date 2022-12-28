//@ts-check
const
    { pool } = require('../../config/pgConfig'),
    { socios: allSocios, seguros: allSeguros } = require('../../infrastructure/SQLqueries/queries')


class MailMessage {

    /* soc = await pool.query(allSocios)
    proc = await pool.query('SELECT * FROM procuradores')

    seguros = seg.rows
    socios = soc.rows
    procuradores = proc.rows
 */
    constructor() {
        this.to = null
        this.subject = null
        this.razaoSocial = null
        this.message = null
    }

    async getSeguros() {
        return await pool.query(allSeguros)
    }
}

module.exports = MailMessage