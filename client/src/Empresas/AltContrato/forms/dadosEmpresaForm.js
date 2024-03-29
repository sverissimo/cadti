import { cnpj, phone, email } from '../../../Forms/commonFields'

export const dadosEmpresaForm = [
    {
        field: 'razaoSocialEdit',
        label: 'Razão Social'
    },
    {
        ...cnpj,
        maxLength: 18,
        //pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
        pattern: '[0-9]{2}.?[0-9]{3}.?[0-9]{3}/?[0-9]{4}-?[0-9]{2}'
    },
    {
        field: 'inscricaoEstadual',
        label: 'Inscrição Estadual',
        maxLength: 13,
        pattern: '\\d{13}'
    },
    {
        ...phone,
        field: 'telefone',
        label: 'Telefone',
    },
    {
        ...email,
        field: 'email',
        label: 'E-mail'
    },
    {
        field: 'cep',
        label: 'CEP',
        maxLength: 10
    },
    {
        field: 'rua',
        label: 'Rua',
        maxLength: 100,
    },
    {
        field: 'numero',
        label: 'Número',
        type: 'number',
        max: 32000
    },
    {
        field: 'complemento',
        label: 'Complemento',
        maxLength: 20,
        required: false
    },
    {
        field: 'bairro',
        label: 'Bairro',
        maxLength: 40,
    },
    {
        field: 'cidade',
        label: 'Cidade',
        maxLength: 60,
    },
    {
        field: 'uf',
        label: 'Estado',
        maxLength: 2,
        pattern: '[A-Z]{2}'
    },
]