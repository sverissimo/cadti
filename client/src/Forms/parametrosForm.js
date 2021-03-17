const
    commonProps = {
        variant: 'outlined',
        pattern: /^[0-9]*$/,
        maxLength: 2
    },
    { variant } = commonProps

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

export const motivosBaixa = [
    {
        field: 'motivoBaixa',
        label: 'Inserir novo motivo',
    }
]