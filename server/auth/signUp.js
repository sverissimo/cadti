const
    bcrypt = require('bcrypt'),
    UserModel = require('../mongo/models/userModel'),
    { getUpdatedData } = require('../infrastructure/SQLqueries/getUpdatedData')

//Cria um hash para a password e salva o usuário
const signUp = async (req, res) => {

    const
        { password, confirmPassword, ...user } = req.body,
        result = await UserModel.find({ $or: [{ 'email': user.email }, { 'cpf': user.cpf }] }),
        userExists = result[0],
        //Busca todos os sócios e procuradores
        procuradores = await getUpdatedData('procuradores'),
        socios = await getUpdatedData('socios'),
        //Pesquisa se o usuário é um sócio ou procurador ja cadastrado no sistema
        proc = procuradores.find(p => p.cpf_procurador === user.cpf),
        socio = socios.find(s => s.cpf_socio === user.cpf)
    let
        empresasProcuracao = [],
        empresasSocio = []

    //Retorna o array de códigos das empresas nas quais o usuário possui vínculo de procurador
    if (proc && proc.empresas)
        empresasProcuracao = proc.empresas

    //Parse do array de empresas
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

    //Verifica se o usuário já existe
    if (userExists)
        return res.status(422).send('Usuário já cadastrado.')

    //Cria o hash da password
    const
        salt = await bcrypt.genSalt(10),
        hashedPassword = await bcrypt.hash(password, salt),
        confirmPass = bcrypt.compareSync(confirmPassword, hashedPassword)

    // confere confirmação de senha
    if (!confirmPass)
        return res.status(422).send('Senhas não conferem.')

    //Salva o usuário no DB
    newUser = new UserModel({ ...user, password: hashedPassword }),
        storedUser = await newUser.save()

    res.send(storedUser)
}

module.exports = signUp