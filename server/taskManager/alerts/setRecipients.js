//@ts-check
const getCollections = require("./getCollections")

/**Busca nas tabelas de sócios e procuradores quais os destinatários receberão o e-mail, com base no código da empresa
 *
 *@param {array} codigo_empresa - Código do delegatário
 *@param {array} razao_social - Razão Social do delegatário
 *@returns {Promise} to - array de strings (e-mails de destinatários)
 */
const setRecipients = async (codigo_empresa, razao_social) => {
    const
        { socios, procuradores } = await getCollections,
        mailObj = {}

    const
        socs = socios
            .filter(s => s.codigo_empresa === codigo_empresa)
            .map(s => s.nome_socio),
        procs = procuradores
            .filter(p => p.codigo_empresa === codigo_empresa)
            .map(p => p.nome_socio),
        to = socs.concat(procs),
        vocativo = razao_social

    Object.assign(mailObj, { to, vocativo })


    /* const shouldReturn = [
        {
            to: ['s@a.com', 'b@const.uk'],
            vocativo: 'razaoSocial',
            apolices: [32, 3]
        }] */

    return mailObj
}

module.exports = setRecipients

