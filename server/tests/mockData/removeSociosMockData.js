//@ts-check
const { fullName, email, phoneNumber } = require('./fakerExports')
const socios = [
    {
        socio_id: 297,
        nome_socio: fullName() + ' __Socio&Procurador',
        cpf_socio: "55",
        email_socio: email(),
        tel_socio: phoneNumber(),
        empresas: [{ "codigoEmpresa": 9060, "share": 42 }]
    },
    /* {
        nome_socio: fullName() + ' __Socio',
        cpf_socio: "222",
        email_socio: email(),
        tel_socio: phoneNumber(),
        share: 22
    } */
]

const cpfsToRemove = ['55', '222']
const codigoEmpresa = 9060

module.exports = { socios, codigoEmpresa, cpfsToRemove }
