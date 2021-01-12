const UserModel = require("../mongo/models/userModel")


const removeEmpresa = async ({ procuradores, codigoEmpresa }) => {

    console.log(procuradores, codigoEmpresa)
    const
        cpfs = procuradores.map(p => p.cpf_procurador),
        filter = ({ 'cpf': { $in: cpfs } })

    UserModel.updateMany(filter, { $pull: { 'empresas': codigoEmpresa } }, (err, doc) => {
        if (err) console.log(err)
        console.log(doc)
    })
}

module.exports = removeEmpresa
