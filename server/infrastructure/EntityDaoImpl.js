//@ts-check
const PostgresDao = require("./PostgresDao");

/**
 * @class GenericDaoImpl
 */
class EntityDaoImpl extends PostgresDao {

    constructor(table, primaryKey) {
        super()
        if (table)
            this.table = table
        if (primaryKey)
            this.primaryKey = primaryKey
    }
}

module.exports = { EntityDaoImpl }