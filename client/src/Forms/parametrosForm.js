const
    commonProps = {
        variant: 'outlined',
        pattern: /^[0-9]*$/,
        maxLength: 2
    },
    { variant } = commonProps

export const distancias = [
    {
        field: 'comercial',
        label: 'Comercial',
    },
    {
        field: 'comercialExecutivo',
        label: 'Comercial Executivo',
    },
    {
        field: 'convencional',
        label: 'Convencional',
    },
    {
        field: 'convencionalExecutivo',
        label: 'Convencional Executivo',
    },
    {
        field: 'leito',
        label: 'Leito',
    },
    {
        field: 'leitoExecutivo',
        label: 'Leito e Executivo'
    },
    {
        field: 'semiLeito',
        label: 'Semi-Leito',
    },
    {
        field: 'semiLeitoExecutivo',
        label: 'Semi-Leito Executivo',
    }
]

export const parametrosIdade = [
    {
        field: 'idadeMaxCad',
        label: 'Idade máxima para cadastro (anos)',
        ...commonProps
    },
    {
        field: 'difIdade',
        label: 'Diferença tolerável de idade da carroceria e chassi (anos)',
        ...commonProps,
        maxLength: 1
    },
    {
        field: 'idadeBaixaAut',
        label: 'Idade para baixa automática (anos)',
        ...commonProps,
    },
    {
        field: 'diaBaixaAut',
        label: 'Dia para baixa automática (dd/mm)',
        maxLength: 5,
        pattern: /^(0[1-9]|[12][0-9]|30(?!\/02)|31(?!\/(0[2469]|11)))\/(0[1-9]|1[0-2])$/,
        variant,
    },
    {
        field: 'prazoAvisoBaixa',
        label: 'Prazo para aviso de baixa (dias)',
        ...commonProps,
        maxLength: 3
    }
]



export const motivosBaixa = [
    {
        field: 'motivoBaixa',
        label: 'Inserir novo motivo',
    }
]


export const nomes = [
    {
        field: 'secretaria',
        label: 'Nome da Secretaria',
    },
    {
        field: 'subsecretaria',
        label: 'Nome da Subsecretaria',
    },
    {
        field: 'superintendencia',
        label: 'Nome da Superintendencia',
    },
    {
        field: 'diretoria',
        label: 'Nome da diretoria',
    },
    {
        field: 'sistema',
        label: 'Nome do sistema',
    },
    {
        field: 'siglaSecretaria',
        label: 'Sigla da Secretaria',
    },
    {
        field: 'siglaSistema',
        label: 'Sigla do Sistema',
    }
]

export const prazosAviso = [
    {
        field: 'prazoAlertaLaudo',
        label: 'Prazos para aviso de vencimento do Laudo (dias)',
        pattern: /^\d+(?:,\s*\d{1,3})*$/,
        maxLength: 50,
    },
    {
        field: 'prazoAlertaProcuracao',
        label: 'Prazos para aviso de vencimento da Procuração (dias)',
        pattern: /^\d+(?:,\s*\d{1,3})*$/,
        maxLength: 50,
    },
    {
        field: 'prazoAlertaSeguro',
        label: 'Prazos para aviso de vencimento do Seguro (dias)',
        pattern: /^\d+(?:,\s*\d{1,3})*$/,
        maxLength: 50,
    }
]



export const adminEmails = [
    {
        field: 'adminEmails',
        label: 'Editar e-mails para envio de alertas diários',
    }
]
