const UserModel = require("../mongo/models/userModel")


const insertEmpresa = async ({ usuarios, codigoEmpresa }) => {
    //Busca os usuários cruzando os cpfs com os dos sócios ou procuradores
    const
        cpfs = usuarios.map(u => u.cpf_procurador || u.cpf_socio),
        users = await UserModel.find({ 'cpf': { $in: cpfs } }),
        updates = []

    //Verifica quais usuários não possuem permissão para a empresa e insere a informação no updates
    users.forEach(u => {
        const empresas = u.empresas || []
        if (!empresas.includes(codigoEmpresa))
            updates.push({ cpf: u.cpf, codigoEmpresa })
    })
    //console.log("🚀 ~ file: insertEmpresa.js ~ line 21 ~ insertEmpresa ~ updates", users, cpfs)

    //Atualiza o as arrays de empresas de cada usuário
    if (updates[0]) {
        updates.forEach(async u => {
            const filter = { 'cpf': u.cpf }
            console.log(filter)
            try {
                await UserModel.update(filter, { $push: { 'empresas': codigoEmpresa } })
            }
            catch (error) {
                console.log(error)
            }
        })
    }
}

module.exports = insertEmpresa
