//@ts-check
const faker = require('faker-br');
const { formatCpf, formatCnpj } = require('./formatValues');

const { email } = faker.internet
const { phoneNumber } = faker.phone

const fullName = () => {
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const fullName = `${firstName} ${lastName}`
    return fullName
}

const cpf = () => faker.br.cpf()
const formattedCpf = () => formatCpf(faker.br.cpf())
const cnpj = () => formatCnpj(faker.br.cnpj())

module.exports = { fullName, email, phoneNumber, cpf, formattedCpf, cnpj }
