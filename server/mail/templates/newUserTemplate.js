const linkParaCadTI = require("../config/linkParaCadTI")

const newUserTemplate = ({ id, email, tempPassword }) => {
    const host = process.env.HOST
    return `
            <p>
                Um novo usuário foi criado com sucesso no
                Sistema de Cadastro do Transporte Intermunicipal - CadTI/Seinfra-MG.
            </p>
            <p>
                Login: <i> ${email}</i>
            </p>
            <p>
                Senha: <i> ${tempPassword} </i>
            </p>
            <p>
                Esta é uma senha temporária. Para alterar sua senha, visite ${linkParaCadTI}, efetue o login e selecione
                a opção disponível no canto superior direito do menu do sistema.
            </p>
            <p>
                Para confirmar o endereço de e-mail e liberar o acesso ao sistema, <a href= ${host}/auth/verifyUser/${id}> clique aqui </a>.
            </p>
    `
}

module.exports = newUserTemplate
