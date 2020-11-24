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
        field: 'convencional',
        label: 'Convencional',
    },
    {
        field: 'executivo',
        label: 'Executivo',
    },
    {
        field: 'semiLeito',
        label: 'Semi-Leito',
    },
    {
        field: 'leito',
        label: 'Leito',
    },
    {
        field: 'urbano',
        label: 'Urbano',
    }
]