//@ts-check
const
    PostgresDao = require("./PostgresDao")


class SocioDaoImpl extends PostgresDao {

    table = 'socios'
    primaryKey = 'socio_id'

}

module.exports = { SocioDaoImpl }