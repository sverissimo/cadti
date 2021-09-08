//@ts-check

/**
 * Classe parent das subclasses de alerta.  
 */
class Alert {

    /** @property {any[]} expiringItems Elementos prestes a vencer*/
    expiringItems = []

    /**
     * @property {string} subject Assunto da mensagem (e-mail)     
     */
    subject;

    /** @property {number[]} prazos Prazos para a criação e envio de alertas */
    prazos;

    /** @property {string} dbQuery Query SELECT passada para o banco de dados*/
    dbQuery;

    /** @property {any[]} mailFields Campos correspondentes no DB que devem aparecer na tabela que consta na mensagem*/
    mailFields = []

    /** @property {string} messageIntro Texto de introdução da mensagem*/
    messageIntro;

    /** @property {string[]} mailHeaders Cabeçalho da tabela contida na mensagem*/
    mailHeaders;

    /** @property {string} messageTip Orientação para como resolver o alerta*/
    messageTip;

    /** @property {string} tipPath Orientação para onde no sistema achar a resolução do alerta*/
    tipPath;

    /** @property {*} recipients Orientação para onde no sistema achar a resolução do alerta*/
    recipients;

    /**Filtra os itens (ex: apólice, procuração, etc) que estão a vencer por empresa, para concentrar todos de uma determinada empresa em um só e-mail.
    * @param {Number} codigo_empresa Código da empresa/delegatário no banco de dados Posgresql
    * @returns Retorna uma array objetos, por ex: apólices de seguros ou procurações a vencer agrupadas por empresa
    */
    getEmpresaExpiringItems(codigo_empresa, expiringItems) {
        const expiringEmpresaItems = expiringItems
            .filter(a => a.codigo_empresa === codigo_empresa)
            .map((/** @type {{ any }} */ item) => {
                const obj = {}
                this.mailFields.forEach(f => Object.assign(obj, { [f]: item[f] }))
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
}

module.exports = Alert
