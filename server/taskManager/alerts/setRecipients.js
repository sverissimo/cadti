//@ts-check
const getCollections = require("./getCollections")

/**Busca nas tabelas de sócios e procuradores quais os destinatários receberão o e-mail, com base no código da empresa
 *
 *@param {array} data - array de objetos, cada um com o campo codigoEmpresa
 *@returns {Promise} to - array de strings (e-mails de destinatários)
 */
const setRecipients = async (data) => {
    const
        { socios, procuradores } = await getCollections,
        empresaComputed = [],
        result = []

    let mailObj = {}

    for (let el of data) {

        const { codigo_empresa, empresa, apolice } = el

        //Se ainda não tem a empresa na lista de e-mails, adiciona
        if (!empresaComputed.includes(codigo_empresa)) {
            empresaComputed.push(codigo_empresa)
            const
                socs = socios
                    .filter(s => s.codigo_empresa === codigo_empresa)
                    .map(s => s.nome_socio),
                procs = procuradores
                    .filter(p => p.codigo_empresa === codigo_empresa)
                    .map(p => p.nome_socio),
                to = socs.concat(procs),
                vocativo = empresa,
                apolices = [apolice]

            Object.assign(mailObj, { to, vocativo })
        }
        mailObj.apolices
        //console.log(soc.map(s => s.nome_socio))
    }

    const shouldReturn = [
        {
            to: ['s@a.com', 'b@const.uk'],
            vocativo: 'razaoSocial',
            apolices: [32, 3]
        }]

    return ['hi']

}

module.exports = setRecipients

