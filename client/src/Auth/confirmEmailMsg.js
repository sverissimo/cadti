//@ts-check
/**
 * 
 * @param {string} vocativo 
 * @param {string} email 
 * @returns {string} - message
 */
const confirmEmailMsg = (vocativo, email) => {
    return `
    Prezado ${vocativo},

    O usuário ${email} foi criado com sucesso no Sistema de Cadastro do Transporte Intermunicipal da Seinfra-MG - CadTI.

    Para confirmar o endereço de e-mail e liberar o acesso ao sistema, clique aqui.

    Caso não tenha feito o cadastro, favor desconsiderar essa mensagem.    
    `

}

export default confirmEmailMsg
