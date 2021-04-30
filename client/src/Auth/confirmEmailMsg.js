//@ts-check
/**
 * 
 * @param {string} email 
 * @returns {string} - message
 */
const confirmEmailMsg = (email, userId) => {
    const host = document.baseURI

    return `
    <p>
    O usuário ${email} foi criado com sucesso no Sistema de Cadastro do Transporte Intermunicipal da Seinfra-MG - CadTI.
    </p>
    <p>
    Para confirmar o endereço de e-mail e liberar o acesso ao sistema, <a href= ${host}auth/verifyUser/${userId}> clique aqui </a>.
    </p>
    Caso não tenha feito o cadastro, favor desconsiderar essa mensagem.`
}

export default confirmEmailMsg
