//@ts-check
const
    { pool } = require('../config/pgConfig'),
    moment = require('moment')


class Alert {

    /** @type {any[]} Elementos prestes a vencer*/
    expiringItems = []

    /** @type {string} Assunto da mensagem (e-mail)*/
    subject;

    /** @type {number[]} Prazos para a criação e envio de alertas */
    prazos;

    /** @type {string} Query SELECT passada para o banco de dados*/
    dbQuery;

    /** @type {any[]} Campos correspondentes no DB que devem aparecer na tabela que consta na mensagem*/
    mailFields = []

    /** @type {string} Texto de introdução da mensagem*/
    messageIntro;

    /** @type {string[]} Cabeçalho da tabela contida na mensagem*/
    mailHeaders;

    /** @type {string} Orientação para como resolver o alerta*/
    messageTip;

    /** @type {string} Orientação para onde no sistema achar a resolução do alerta*/
    tipPath;


    /**
     * Busca todos os itens de uma tabela do Postgresql, com base na query de cada child class     
     */
    async getCollection() {
        const
            data = await pool.query(this.dbQuery),
            collection = data.rows
        return collection
    }

    /**
     * Verifica itens de collections com vencimento em um determinado prazo (dias) ou em múltiplos prazos (alertas múltiplos).
     * @param {Array} collection Tabela do Postgresql na qual será feita a verificação do vencimento
     * @param {Array} prazos array de prazos, em dias. 
     */
    checkExpiring(collection, prazos) {
        const expiringItems = collection.filter(el => {
            const
                checkPrazo = (/** @type {moment.DurationInputArg1} */ prazo) => moment(el.vencimento || el.validade).isSame(moment().add(prazo, 'days'), 'days'),
                vencendo = prazos.some(p => checkPrazo(p))

            return vencendo
        })
        this.expiringItems = expiringItems
        return expiringItems
    }


    /**
     * Filtra as empresas das quais um ou mais elementos estão próximos do vencimento (ex: seguros, procurações, etc)
     * @param {Array} expiringItems - elementos a vencer
     * @returns {Array} array de objetos com as props codigo_empresa e razao_social
     * */
    getEmpresas(expiringItems) {
        //const empresas = new Set(expiringItems.map(e => e.codigo_empresa))
        const codigosEmpresas = []
        const empresas = expiringItems
            .filter(e => !codigosEmpresas.includes(e.codigo_empresa) && codigosEmpresas.push(e.codigo_empresa))
            .map(({ codigo_empresa, empresa, razao_social }) => ({ codigo_empresa, razao_social: empresa || razao_social }))

        return empresas
    }


    /**Filtra os itens (ex: apólice, procuração, etc) que estão a vencer por empresa, para concentrar todos de uma determinada empresa em um só e-mail.
    * @param {Number} codigo_empresa Código da empresa/delegatário no banco de dados Posgresql
    * @returns Retorna uma array objetos, por ex: apólices de seguros ou procurações a vencer agrupadas por empresa
    */
    getEmpresaExpiringItems(codigo_empresa) {
        const expiringEmpresaItems = this.expiringItems
            .filter(a => a.codigo_empresa === codigo_empresa)
            .map((item) => {
                const obj = {}
                this.mailFields.forEach(f => Object.assign(obj, { [f]: item[f] }))
                this.addProcsName(obj)
                return obj
            })

        return expiringEmpresaItems
    }

    /**
     * Cria a mensagem que será enviada por e-mail. A mensagem é dividida em intro, details, tip e tipPath.
     * intro contém o início da mensagem, com o conteúdo do que se trata; * details são os detalhes que vêm dos objetos gerados em getEmpresaExpiredItems;
     * tip é a orientação para como resolver o alerta; * tipPath é o caminho que deve ser percorrido no sistema para resolver o alerta.
     * @param {array} expiringEmpresaItems - array de objetos com as props (ex: { numero, vencimento, etc }), gerados no getEmpresaExpiringItems
     * @returns {object} objeto com a mensagem dividida em partes (intro, details, tip e tipPath) para a formatação e envio do e-mail.
     */
    createMessage(expiringEmpresaItems) {
        //console.log("🚀 ~ file: SeguroAlert.js ~ line 30 ~ SeguroAlert ~ createMessage ~ apolices", apolices)

        if (expiringEmpresaItems.length > 0) {

            const message = {
                intro: this.messageIntro,
                tableHeaders: this.mailHeaders,
                tableData: expiringEmpresaItems,
                tip: this.messageTip,
                tipPath: this.tipPath
            }
            return message
        }
    }
    /**
     * Adiciona os nomes dos procuradores em um objeto que tenha array de procurador_id. Método específico para as subClasses que implementarem (ex: ProcuracaoAlert)
     * @param {object} obj - item a expirar (criado pelo método this.getEmpresaExpiringItems)
     */
    addProcsName(obj) { void 0 }
}

module.exports = Alert
