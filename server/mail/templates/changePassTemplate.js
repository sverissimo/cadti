const
    linkParaCadTI = require("../config/linkParaCadTI")
    , footer = require("./footer")


const changePassTemplate = (password) => {

    return `    
            <p>
                Você solicitou a recuperação de sua senha no sistema CadTI - Seinfra. 
                Sua nova senha é:
            </p>
            <p>
               <i> ${password} </i>
            </p>     
            <p>
                Para alterar sua senha, visite ${linkParaCadTI}, efetue o login e selecione 
                a opção disponível no canto superior direito do menu do sistema.
            </p>                         
            <p>
                ${footer}
            </p>
    `
}

module.exports = changePassTemplate