import cpfValidator from '../Utils/cpfValidator'
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
    },
    email = {
        label: 'E-mail',
        type: 'email',
        maxLength: 60,
        pattern: '[a-zA-Z0-9]@[a-zA-Z0-9]{1,20}?[.]([a-zA-Z0-9])',
    }