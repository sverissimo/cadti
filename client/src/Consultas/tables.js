import { formatDate } from '../Utils/formatValues'

export const delegatarioTable = [
    {
        field: 'razaoSocial',
        title: 'Razão Social',
    },
    {
        field: 'delegatarioStatus',
        title: 'Situação',
    },
    {
        field: 'vencimentoContrato',
        title: 'Data de Vencimento',
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
    /*   {
          field: 'procuradoresList',
          title: 'Nome do Procurador',
          fSize: '0.3rem',
          render: rowData => rowData.procuradoresList
              ?
              rowData.procuradoresList.map(s => s.charAt(0).toUpperCase()
                  .concat(s.slice(1).toLowerCase())).toString().replace(/,/g, ", ")
              :
              ''
      } */
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
        field: 'modeloCarroceria',
        title: 'Modelo da Carroceria',
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
        field: 'indicadorIdade',
        title: 'Ano de Fabricação',
        filtering: false
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
