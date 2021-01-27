const { getUpdatedData } = require("../getUpdatedData")
const UserModel = require("../mongo/models/userModel")


const removeEmpresa = async ({ representantes, codigoEmpresa }) => {

    console.log("🚀 ~ file: removeEmpresa.js ~ line 7 ~ removeEmpresa ~ representantes", representantes)

    codigoEmpresa = +codigoEmpresa

    const
        cpfs = await shouldUpdate(representantes, codigoEmpresa),
        filter = ({ 'cpf': { $in: cpfs } })

    console.log("🚀 ~ file: removeEmpresa.js ~ line 10 ~ removeEmpresa ~ filter", cpfs, filter)

    if (cpfs)
        UserModel.updateMany(filter, { $pull: { 'empresas': codigoEmpresa } }, async (err, doc) => {
            if (err) console.log(err)
            console.log(doc)
        })
}

async function shouldUpdate(representantes, codigoEmpresa) {
    const
        procuracoes = await getUpdatedData('procuracoes'),
        procuradores = await getUpdatedData('procuradores'),
        filteredDocs = procuracoes.filter(p => p.codigo_empresa === codigoEmpresa)

    //Se se está apagando um sócio, verificar se alguma procuração vigente contém o cpf dele. Nesse caso, não remove da permissão do usuário
    if (representantes[0] && representantes[0].cpf_socio) {
        let shouldUpdate = true
        const
            { cpf_socio } = representantes[0],
            cpfs = []

        filteredDocs.forEach(doc => {               //Selecionar cpfs que constam nas procurações
            if (Array.isArray(doc.procuradores)) {
                procuradores.forEach(pr => {
                    if (doc.procuradores.includes(pr.procurador_id))
                        cpfs.push(pr.cpf_procurador)
                })
            }
        })
        if (cpfs.includes(cpf_socio))
            shouldUpdate = false

        //console.log("🚀 ~ file: removeEmpresa.js ~ line 58 ~ shouldUpdate ~ cpf_socio", cpf_socio)

        if (shouldUpdate)
            return [cpf_socio]
        else
            return false
    }

    //Se se está apagando uma procuração/procurador(es), verifica se o usuário é sócio dessa mesma empresa. Se for, mantém permissão
    if (representantes[0] && representantes[0].cpf_procurador) {
        const
            indexes = [],
            socios = await getUpdatedData('socios'),
            cpfProcuradores = representantes.map(r => r.cpf_procurador),
            cpfSocios = socios
                .filter(s => s.codigo_empresa === codigoEmpresa)
                .map(s => s.cpf_socio)
        // console.log("🚀 ~ file: removeEmpresa.js ~ line 79 ~ shouldUpdate ~ cpfProcuradores", cpfProcuradores)
        cpfProcuradores.forEach((cpf, i) => {

            if (cpfSocios.includes(cpf))
                indexes.push(i)
        })
        indexes.forEach(i => cpfProcuradores.splice(i))

        //  console.log("🚀 ~ file: removeEmpresa.js ~ line 79 ~ shouldUpdate ~ cpfProcuradores", cpfProcuradores)
        //Retorna os cpfs para excluir a permissão de usuário
        if (cpfProcuradores[0])
            return cpfProcuradores
        else
            return false
    }
}

module.exports = removeEmpresa
