//@ts-check
const bcrypt = require('bcrypt')
const UserModel = require('../mongo/models/userModel')
const { getUpdatedData } = require('../infrastructure/SQLqueries/getUpdatedData')
const { UserService } = require('../services/UserService')

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
}

const confirmPassword = (confirmPassword, hashedPassword) => {
    return bcrypt.compareSync(confirmPassword, hashedPassword)
}

//Cria um hash para a password e salva o usuário
const signUp = async (req, res) => {
    const { password, confirmPassword, ...user } = req.body
    const userExists = await UserService.find(user)

    //Verifica se o usuário já existe
    if (userExists)
        return res.status(422).send('Usuário já cadastrado.')

    const hashedPassword = await hashPassword(password)

    // confere confirmação de senha
    const confirmPass = confirmPassword(confirmPassword, hashedPassword)
    if (!confirmPass)
        return res.status(422).send('Senhas não conferem.')

    const procuradores = await getUpdatedData('procuradores')
    const socios = await getUpdatedData('socios')
    const proc = procuradores.find(p => p.cpf_procurador === user.cpf)
    const socio = socios.find(s => s.cpf_socio === user.cpf)

    let empresasProcuracao = []
    let empresasSocio = []

    //Retorna o array de códigos das empresas nas quais o usuário possui vínculo de procurador
    if (proc && proc.empresas) {
        empresasProcuracao = proc.empresas
    }

    if (socio && socio.empresas)
        try {
            empresasSocio = (JSON.parse(socio.empresas))
        } catch (error) {
            console.log(error)
        }

    //Retorna o array de códigos das empresas nas quais o usuário possui vínculo de sócio
    empresasSocio = empresasSocio.map(e => e.codigoEmpresa)
    const empresas = empresasProcuracao.concat(empresasSocio)

    if (empresas && empresas[0])
        user.empresas = empresas

    const newUser = await UserModel.create({ ...user, password: hashedPassword })

    res.send(newUser)
}

module.exports = signUp