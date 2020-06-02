import cpfValidator from '../Utils/cpfValidator'
import { cnpjValidator } from '../Utils/cnpjValidator'

import { clearFormat } from '../Utils/formatValues'

export const
    razaoSocial = {
        field: 'razaoSocial',
        label: 'Empresa',
        width: '340px'
    },
    placas = {
        field: 'placas',
        label: 'Veículos cadastrados',
        width: '340px'
    },
    createdAt = {
        field: 'createdAt',
        label: 'Data do registro no sistema',
        type: 'date',
        width: '190px'
    },
    cnpj = {
        field: 'cnpj',
        label: 'CNPJ',
        maxLength: 18,
        pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
        errorHandler: (cnpjString) => cnpjValidator(cnpjString)
    },
    cpf = {
        field: 'cpfSocio',
        label: 'CPF',
        maxLength: 14,
        width: 190,
        errorHandler: (cpfString) => cpfValidator(clearFormat(cpfString))
    },
    phone = {
        label: 'Telefone',
        minLength: 14,
        maxLength: 15,
        pattern: '((([+][0-9]{1,3})?[ ]?[-]?[(]?[0-9]{2,3}[)]?[ ]?[-]?[0-9]{4,5}[ ]?[-]?[0-9]{4}))'

    },
    email = {
        label: 'E-mail',
        type: 'email',
        maxLength: 60,
        pattern: '[a-zA-Z0-9]@[a-zA-Z0-9]{1,20}?[.]([a-zA-Z0-9])',
    }