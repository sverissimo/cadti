const { getUpdatedData } = require("../infrastructure/SQLqueries/getUpdatedData")
const UserModel = require("../mongo/models/userModel")


const removeEmpresa = async ({ representantes, codigoEmpresa }) => {

    // console.log("🚀 ~ file: removeEmpresa.js ~ line 7 ~ removeEmpresa ~ representantes", representantes)
    codigoEmpresa = +codigoEmpresa
    console.log("🚀 ~ file: removeEmpresa.js ~ line 9 ~ removeEmpresa ~ codigoEmpresa", codigoEmpresa)
    const
        cpfs = await shouldUpdate(representantes, codigoEmpresa),
        filter = ({ 'cpf': { $in: cpfs } })

    console.log("🚀 ~ file: removeEmpresa.js ~ line 11 ~ removeEmpresa ~   cpfs", filter)
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
        filteredDocs = procuracoes.filter(p => p.codigo_empresa == codigoEmpresa)
    //console.log("🚀 ~ file: removeEmpresa.js ~ line 27 ~ shouldUpdate ~ filteredDocs", filteredDocs)

    //Se se está apagando um sócio, verificar se alguma procuração vigente contém o cpf dele. Nesse caso, não remove da permissão do usuário

    if (representantes[0] && representantes[0].cpf_socio) {
        const
            allCpfs = representantes.map(s => s.cpf_socio),
            cpfsToKeep = []

        filteredDocs.forEach(doc => {               //Selecionar cpfs que constam nas procurações
            if (Array.isArray(doc.procuradores)) {
                procuradores.forEach(pr => {
                    if (doc.procuradores.includes(pr.procurador_id))
                        cpfsToKeep.push(pr.cpf_procurador)
                })
            }
        })
        const cpfsToRemove = allCpfs.filter(cpf => !cpfsToKeep.includes(cpf))
        console.log("🚀 ~ file: removeEmpresa.js ~ line 44 ~ shouldUpdate ~ cpfsToKeep", cpfsToKeep)
        console.log("🚀 ~ file: removeEmpresa.js ~ line 44 ~ shouldUpdate ~ cpfsToRemove", cpfsToRemove)


        if (cpfsToRemove)
            return cpfsToRemove
        else
            return false
    }

    //Se se está apagando uma procuração/procurador(es), verifica se o usuário é sócio dessa mesma empresa. Se for, mantém permissão
    if (representantes[0] && representantes[0].cpf_procurador) {
        const
            dontRemove = [],
            socios = await getUpdatedData('socios'),
            cpfProcuradores = representantes.map(r => r.cpf_procurador),
            cpfSocios = socios
                .filter(s => s.empresas.match(codigoEmpresa))
                .map(s => s.cpf_socio)
        //console.log("🚀 ~ file: removeEmpresa.js ~ line 84 ~ shouldUpdate ~ cpfSocios", cpfSocios, codigoEmpresa)

        //Evita retirada de permissão de sócios
        for (const cpf of cpfProcuradores) {
            //console.log(cpf)
            if (cpfSocios.includes(cpf))
                dontRemove.push(cpf)
        }
        //Checa se há outra procuração
        for (const p of representantes) {
            const
                otherValidProcs = filteredDocs.filter(d => d.procuradores.includes(p.procurador_id)),
                keepThisCpfToo = otherValidProcs.length > 1
            if (keepThisCpfToo && !dontRemove.includes(p.cpf_procurador))
                dontRemove.push(p.cpf_procurador)
        }
        //console.log("🚀 ~ file: removeEmpresa.js ~ line 79 ~ shouldUpdate ~ cpfProcuradores", cpfProcuradores, cpfSocios)

        const cpfsToRemove = cpfProcuradores.filter(cpf => !dontRemove.includes(cpf))

        console.log("🚀 ~ file: removeEmpresa.js ~ line 79 ~ shouldUpdate ~ dontRemove", dontRemove)
        console.log("🚀 ~ file: removeEmpresa.js ~ line 92 ~ shouldUpdate ~ cpfsToRemove", cpfsToRemove)

        //Retorna os cpfs para excluir a permissão de usuário
        if (cpfsToRemove[0])
            return cpfsToRemove
        else
            return false
    }
}

module.exports = removeEmpresa
