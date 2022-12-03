//@ts-check
const PostgresDao = require("./PostgresDao")

class ProcuradorDaoImpl extends PostgresDao {

    constructor() {
        super()
        this.table = 'procuradores'
        this.primaryKey = 'procurador_id'
    }
}

module.exports = { ProcuradorDaoImpl }
