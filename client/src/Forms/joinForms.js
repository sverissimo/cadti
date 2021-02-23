import { razaoSocial, placas, createdAt } from '../Forms/commonFields'

export const eForm = [
    {
        field: 'razaoSocial',
        width: '540px'
    },
    {
        field: 'rua',
        width: '540px'
    },
    {
        field: 'situacao',
        label: 'Situação'
    },
    {
        field: 'codigoEmpresa',
        label: 'Código da Empresa'
    },
    {
        ...createdAt,
        width: '150px',
    },
    {
        field: 'frota',
        label: 'Tamanho da Frota'
    }
]

export const sForm = [
    {
        ...razaoSocial
    },
    {
        ...createdAt
    },
]

export const segForm = [
    {
        ...razaoSocial
    },
    {
        ...createdAt
    },
    {
        ...placas
    },
    {
        field: 'segurados',
        label: 'Número de veículos segurados',
    },
]

export const vForm = [
    {
        field: 'dataRegistro',
        label: 'Data do registro no sistema',
        type: 'date',
    },
    {
        field: 'pbt',
        label: 'Peso Bruto Total'
    },
    {
        field: 'situacao',
        label: 'Situação'
    },
    {
        field: 'indicadorIdade',
        label: 'Indicador de idade'
    },
    {
        field: 'equipamentos',
        label: 'Equipamentos'
    },
    {
        field: 'marcaChassi',
        label: 'Marca do Chassi',
    },
    {
        field: 'marcaCarroceria',
        label: 'Marca da Carroceria',
    },
    {
        field: 'sipro',
        label: 'SEI',
    },
    {
        field: 'compartilhado',
        label: 'Compartilhado por'
    },
    {
        field: 'codigoCompartilhado',
        label: 'Código Del. Compartilhado',
    },
    {
        field: 'empresaLaudo',
        label: 'Empresa Laudo',
    },
    {
        field: 'numeroLaudo',
        label: 'Número do Laudo',
    },
    {
        field: 'vencimentoLaudo',
        label: 'Validade do Laudo',
        type: 'date'
    },
]