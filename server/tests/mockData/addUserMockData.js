const { fullName, email } = require('./fakerExports')
const userMockData = [
    {
        name: fullName() + ' __Socio&Procurador',
        cpf: "111",
        email: email(),
        role: "empresa",
    },
    {
        name: fullName() + ' __Socio',
        cpf: "222",
        email: email(),
        role: "empresa",
    },
    {
        name: fullName() + ' __ProcuradorcomDoc',
        cpf: "333",
        email: email(),
        role: "empresa",
    },
    {
        name: fullName() + ' __ProcuradorSemDoc',
        cpf: "444",
        email: email(),
        role: "empresa",
    },
    {
        name: fullName() + ' __NotProcuradorNorSocio',
        cpf: "555",
        email: email(),
        role: "empresa",
    },
]

module.exports = { userMockData }
