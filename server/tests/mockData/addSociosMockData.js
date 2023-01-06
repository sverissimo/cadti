//@ts-check
const { fullName, email, phoneNumber } = require('./fakerExports')
const addSociosMockData = [
    {
        nome_socio: fullName() + ' __Socio&Procurador',
        cpf_socio: "111",
        email_socio: email(),
        tel_socio: phoneNumber(),
        share: 11
    },
    {
        nome_socio: fullName() + ' __Socio',
        cpf_socio: "222",
        email_socio: email(),
        tel_socio: phoneNumber(),
        share: 22
    }
]



module.exports = { addSociosMockData }