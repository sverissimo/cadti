const
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
    }

export const eForm = [
    {
        field: 'delegatarioStatus',
        label: 'Status'
    },
    {
        field: 'vencimentoContrato',
        label: 'Vencimento do Contrato',
        type: 'date',
    },
    {
        ...createdAt
    },
    {
        field: 'frota',
        label: 'Tamanho da Frota'
    },
    {
        field: 'oldId',
        label: 'Código no sistema antigo'
    },
    {
        ...placas
    },

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
        field: 'equipamentosId',
        label: 'Equipamentos'
    },
    {
        field: 'compartilhado',
        label: 'Compartilhado por'
    },
    {
        field: 'marcaChassi',
        label: 'Marca do Chassi',
    },
    {
        field: 'marcaCarroceria',
        label: 'Marca da Carroceria',                
    },
]