//@ts-check
const RecipientsRepository = require('../repositories/RecipientsRepository');


class RecipientService {

    /** @type {any[]} */
    socios;

    /** @type {any[]} */
    procuradores;

    /**
     * Obtém todos os sócios e procuradores do banco de dados
     */
    getAllRecipients = async () => {

        const allRecipients = await new RecipientsRepository().getAllRecipients()
        return allRecipients
    }

    /** 
    * Retorna um objeto com vocativo os e-mails de todos os sócios e procuradores de uma empresa
    * 
    * @param {number} codigo_empresa  - Código do delegatário
    * @param {string} razao_social  - Razão Social do delegatário
    * @param {{socios: Array<Object>, procuradores: Object[]}} allRecipients
    * @throws Gera erro se o método this.getAllRecipients não tiver sido chamado e portanto this.socios/procuradores === undefined
    * @returns array de strings (vocativo e e-mails de destinatários)
    */
    setRecipients = (codigo_empresa, razao_social, allRecipients) => {

        const { socios, procuradores } = allRecipients

        if (!socios || !procuradores)
            throw new Error('É necessário buscar os sócios e procuradores dos delegatários antes de chamar esse método (setRecipients).')

        const
            mailObj = {}
            , socs = socios
                .filter(s => s.codigo_empresa === codigo_empresa)
                .map(s => s.nome_socio)
            , procs = procuradores
                .filter(p => p.codigo_empresa === codigo_empresa)
                .map(p => p.nome_procurador)
            , to = socs.concat(procs)
            , vocativo = razao_social

        Object.assign(mailObj, { to, vocativo })

        return mailObj
    }
}

module.exports = RecipientService
