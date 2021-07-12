//@ts-check
const
    { pool } = require('../config/pgConfig'),
    { socios: getSocsQuery } = require('../queries'),
    { procuradores: getProcuradores } = require('../allGetQueries'),
    getProcsQuery = getProcuradores()


class Recipients {

    /** @type {any[]} */
    socios;

    /** @type {any[]} */
    procuradores;

    /**
     * Obtém todos os sócios e procuradores do banco de dados
     */
    getAllRecipients = async () => {

        const
            socsPromise = pool.query(getSocsQuery),
            procsPromise = pool.query(getProcsQuery),
            keys = ['socios', 'procuradores'],
            result = {}

        await Promise.all([socsPromise, procsPromise])
            .then(r =>
                r.forEach((q, i) => {
                    const key = keys[i]
                    Object.assign(result, { [key]: q.rows })
                })
            )
        const { socios, procuradores } = result
        this.socios = socios
        this.procuradores = procuradores
        return result
    }

    /** 
     * Retorna um objeto com vocativo os e-mails de todos os sócios e procuradores de uma empresa
     * 
     * @param {*} codigo_empresa  - Código do delegatário
     * @param {*} razao_social  - Razão Social do delegatário
     * @throws Gera erro se o método this.getAllRecipients não tiver sido chamado e portanto this.socios/procuradores === undefined
     * @returns array de strings (vocativo e e-mails de destinatários)
     */
    setRecipients = (codigo_empresa, razao_social) => {

        if (!this.socios || !this.procuradores)
            throw new Error('É necessário buscar os sócios e procuradores dos delegatários antes de chamar esse método (setRecipients).')

        const
            mailObj = {},
            socs = this.socios
                .filter(s => s.codigo_empresa === codigo_empresa)
                .map(s => s.nome_socio),
            procs = this.procuradores
                .filter(p => p.codigo_empresa === codigo_empresa)
                .map(p => p.nome_procurador),
            to = socs.concat(procs),
            vocativo = razao_social

        Object.assign(mailObj, { to, vocativo })

        return mailObj
    }
}

module.exports = Recipients