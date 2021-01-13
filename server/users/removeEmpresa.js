const { pool } = require("../config/pgConfig")
const { getUpdatedData } = require("../getUpdatedData")
const UserModel = require("../mongo/models/userModel")


const removeEmpresa = async ({ usuarios, codigoEmpresa }) => {

    codigoEmpresa = +codigoEmpresa

    shouldUpdate(usuarios, codigoEmpresa)
    return
    const
        cpfs = usuarios.map(u => u.cpf_procurador || u.cpf_socio),
        filter = ({ 'cpf': { $in: cpfs } })

    //console.log("🚀 ~ file: removeEmpresa.js ~ line 10 ~ removeEmpresa ~ filter", cpfs, filter)
    UserModel.updateMany(filter, { $pull: { 'empresas': codigoEmpresa } }, async (err, doc) => {
        if (err) console.log(err)
        console.log(doc)
    })
}

async function shouldUpdate(usuarios, codigoEmpresa) {
    const
        procuracoes = await getUpdatedData('procuracoes'),
        filteredDocs = procuracoes.filter(p => p.codigo_empresa === codigoEmpresa)

    let shouldUpdate = true

    //Se se está apagando um sócio, verificar se alguma procuração vigente contém o cpf dele. Nesse caso, não remove da permissão do usuário
    if (usuarios[0] && usuarios[0].cpf_socio) {
        const { cpf_socio, socio_id } = usuarios[0]

        filteredDocs.forEach(doc => {
            if (doc.procuradores.includes(socio_id))
                shouldUpdate = false
        })
        if (shouldUpdate)
            return [cpf_socio]
        else
            return false
    }
    //Se se está apagando uma procuração, verifica se o usuário é sócio dessa mesma empresa. Se for, mantém permissão
    if (usuarios[0] && usuarios[0].cpf_procurador) {
        const
            requestSocios = await getUpdatedData('socios'),
            socios = requestSocios
                .filter(s => s.codigo_empresa === codigoEmpresa)
                .map(s => s.cpf_socios)
        console.log(socios)
    }


    console.log("🚀 ~ file: removeEmpresa.js ~ line 36 ~ shouldUpdate ~ dontUpdate", dontUpdate)

}

module.exports = removeEmpresa
