import formatDate from '../Utils/formatDate'
export const vehicleTable = [
    {
        field: 'placa',
        title: 'Placa',
    },
    {
        field: 'utilizacao',
        title: 'Utilização',
    },
    {
        field: 'empresa',
        title: 'Delegatário',
    },
    {
        field: 'modeloCarroceriaId',
        title: 'Modelo da Carroceria',
    },
    {
        field: 'poltronas',
        title: 'Número de Poltronas',
        filtering: false
    },
    {
        field: 'dataRegistro',
        title: 'Data de Registro',
        filtering: false,
        render: rowData => formatDate(rowData.dataRegistro)
    },
    {
        field: 'indicadorIdade',
        title: 'Ano de Fabricação',
        filtering: false
    }
]

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
        field: 'municipioDelegatario',
        title: 'Município',
    },
    {
        field: 'telefone',
        title: 'Telefone',
    },
    {
        field: 'procuradoresList',
        title: 'Nome do Procurador',
        render: rowData => rowData.procuradoresList ? rowData.procuradoresList.toString().replace(/,/g, ", ") : ''
    }
]

export const procuradorTable = [
    {
        field: 'nomeProcurador',
        title: 'Nome',
    },
    {
        field: 'cpf',
        title: 'CPF',
    },
    {
        field: 'razaoSocial',
        title: 'Delegatário(s)',
    },
    {
        field: 'dataInicio',
        title: 'Início da Procuração',
        filtering: false,
        render: rowData => formatDate(rowData.dataInicio)
    },
    {
        field: 'dataFim',
        title: 'Vigência da Procuração',
        filtering: false,
        render: rowData => formatDate(rowData.dataFim)
    }
]

export const tables = [vehicleTable].concat([delegatarioTable]).concat([procuradorTable])
