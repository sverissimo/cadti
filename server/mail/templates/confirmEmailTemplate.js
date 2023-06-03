//@ts-check

/**
 * @param {object} any
 * @returns {string} - message
 */
const confirmEmailTemplate = ({ id, email }) => {
    const host = process.env.HOST

    return `
    <p>
    O usuário ${email} foi criado com sucesso no Sistema de Cadastro do Transporte Intermunicipal da Seinfra-MG - CadTI.
    </p>
    <p>
    Para confirmar o endereço de e-mail e liberar o acesso ao sistema, <a href= ${host}/auth/verifyUser/${id}> clique aqui </a>.
    </p>
    Caso não tenha feito o cadastro, favor desconsiderar essa mensagem.
    `
}

module.exports = { confirmEmailTemplate }
