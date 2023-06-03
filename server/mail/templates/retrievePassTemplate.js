const linkParaCadTI = require("../config/linkParaCadTI")

const retrievePassTemplate = ({ password }) => {
    return `
            <p>
                Você solicitou a recuperação de sua senha no sistema CadTI - Seinfra.
                Sua nova senha é:
            </p>
            <p>
               <i> ${password} </i>
            </p>
            <p>
                Esta é uma senha temporária. Para alterar sua senha, visite ${linkParaCadTI}, efetue o login e selecione
                a opção disponível no canto superior direito do menu do sistema.
            </p>
    `
}

module.exports = { retrievePassTemplate }
