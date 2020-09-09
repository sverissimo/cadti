import { formatDate } from '../Utils/formatValues'

export const delegatarioTable = [
    {
        field: 'razaoSocial',
        title: 'Razão Social',
    },
    {
        field: 'cnpj',
        title: 'CNPJ',
    },
    {
        field: 'vencimentoContrato',
        title: 'Vencimento do Cadastro',
        filtering: false,
        render: rowData => formatDate(rowData.vencimentoContrato)
    },
    {
        field: 'cidade',
        title: 'Município',
    },
    {
        field: 'telefone',
        title: 'Telefone',
    },
    {
        field: 'frota',
        title: 'Tamanho da frota'
    }
]

export const sociosTable = [
    {
        field: 'nomeSocio',
        title: 'Nome',
    },
    {
        field: 'cpfSocio',
        title: 'CPF',
    },
    {
        field: 'razaoSocial',
        title: 'Delegatário(s)',
    },
    {
        field: 'emailSocio',
        title: 'E-mail',

    },
    {
        field: 'telSocio',
        title: 'Telefone',

    },
    {
        field: 'share',
        title: 'Participação Societária (%)',
        filtering: false,
    }
]


export const procuradorTable = [
    {
        field: 'nomeProcurador',
        title: 'Nome',
    },
    {
        field: 'cpfProcurador',
        title: 'CPF',
    },
    {
        field: 'emailProcurador',
        title: 'E-mail',
    },
    {
        field: 'telProcurador',
        title: 'Telefone'
    }
]

export const vehicleTable = [
    {
        field: 'placa',
        title: 'Placa',
    },
    {
        field: 'empresa',
        title: 'Delegatário',
    },
    {
        field: 'seguradora',
        title: 'Seguradora',
    },
    {
        field: 'apolice',
        title: 'Número da Apólice',
    },
    {
        field: 'vencimento',
        title: 'Vencimento Seguro',
        render: rowData => formatDate(rowData.vencimento)
    },
    {
        field: 'situacao',
        title: 'Situação',
    },
    {
        field: 'compartilhado',
        title: 'Compartilhado por'
    },
    /*  {
         field: 'anoCarroceria',
         title: 'Ano de Fabricação',
         filtering: false
     } */
    {
        field: 'indicadorIdade',
        title: 'Indicador de idade',
        render: rowData => {
            let timeUnit = ' anos'
            if (rowData['indicadorIdade'] < 2)
                timeUnit = ' ano'
            return rowData['indicadorIdade'].toString() + timeUnit
        }
    }
]

export const segurosTable = [
    {
        field: 'apolice',
        title: 'Número da Apólice',
    },
    {
        field: 'seguradora',
        title: 'Seguradora',
    },
    {
        field: 'empresa',
        title: 'Segurado',
    },
    {
        field: 'segurados',
        title: 'Número de veículos',
    },
    {
        field: 'vencimento',
        title: 'Vencimento',
        filtering: false,
        render: rowData => formatDate(rowData.vencimento)
    }
]

export const tables = [delegatarioTable].concat([sociosTable]).concat([procuradorTable]).concat([vehicleTable]).concat([segurosTable])
