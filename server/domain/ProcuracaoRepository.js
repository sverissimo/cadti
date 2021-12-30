const CustomPostgresRepositoryImpl = require("../infrastructure/repository/CustomPostgresRepositoryImpl");

class ProcuracaoRepository extends CustomPostgresRepositoryImpl {

    table = 'procuracoes';
    primaryKey = 'procuracao_id'

    constructor() {
        super()
    }

}

module.exports = ProcuracaoRepository