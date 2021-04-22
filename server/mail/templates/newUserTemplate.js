const
    linkParaCadTI = require("../config/linkParaCadTI")
    , footer = require("./footer")


const newUserTemplate = (email, password) => {

    return `    
            <p>
                Um novo usuário foi criado com sucesso no 
                Sistema de Cadastro do Transporte Intermunicipal - CadTI/Seinfra-MG.
            </p>
            <p>
                Login: <i> ${email}</i>
            </p>
            <p>
                Senha: <i> ${password} </i>
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

module.exports = newUserTemplate