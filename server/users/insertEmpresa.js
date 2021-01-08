const UserModel = require("../mongo/models/userModel")


const insertEmpresa = async ({ procuradores, codigoEmpresa }) => {

    console.log(procuradores, codigoEmpresa)
    const
        cpfs = procuradores.map(p => p.cpfProcurador),
        users = await UserModel.find({ 'cpf': { $in: cpfs } }),
        updates = []
    //Verifica quais usuários não possuem permissão para a empresa e insere a informação no updates
    users.forEach(u => {
        const empresas = u.empresas || []
        if (!empresas.includes(codigoEmpresa))
            updates.push({ cpf: u.cpf, codigoEmpresa })
    })
    console.log(updates, users, updates)
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
