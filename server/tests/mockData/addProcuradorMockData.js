//@ts-check
const { fullName, email, phoneNumber } = require('./fakerExports')
const addProcuradorMockData = [
    {
        nome_procurador: fullName() + ' __Socio&Procurador',
        email_procurador: email(),
        tel_procurador: phoneNumber(),
        cpf_procurador: '111',
        empresas: []
    },
    {
        nome_procurador: fullName() + ' __ProcuradorcomDoc',
        email_procurador: email(),
        tel_procurador: phoneNumber(),
        cpf_procurador: '333',
        empresas: []
    },
    {
        nome_procurador: fullName() + ' __ProcuradorSemDoc',
        email_procurador: email(),
        tel_procurador: phoneNumber(),
        cpf_procurador: '444',
        empresas: []
    }
]

module.exports = { addProcuradorMockData }
