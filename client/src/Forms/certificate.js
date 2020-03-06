export const delegatario = [
    {
        field: 'razaoSocial',
        label: 'Delegatário'
    },
    {
        field: 'vencimento',
        label: 'validade'
    },
]

export const caracteristicas = [
    [
        {
            field: 'placa',
            label: 'Placa'
        },
        {
            field: 'renavam',
            label: 'Renavam'
        },
        {
            field: 'poltronas',
            label: 'Poltronas',
        },
        {
            field: 'piquesPoltrona',
            label: 'Piques poltrona',
        },
        {
            field: 'nChassi',
            label: 'Número do Chassi',
        },

    ],
    [
        {
            field: 'marcaChassi',
            label: 'Marca do Chassi',
        },
        {
            field: 'modeloChassi',
            label: 'Modelo do Chassi',
        },
        {
            field: 'anoChassi',
            label: 'Ano do chassi',
        },
        {
            field: 'distanciaMinima',
            label: 'Distância Mínima (cm)',
        },
        {
            field: 'distanciaMaxima',
            label: 'Distância Máxima (cm)'
        }
    ],
    [
        {
            field: 'marcaCarroceria',
            label: 'Marca da Carroceria',
        },
        {
            field: 'modeloCarroceria',
            label: 'Modelo da Carroceria',
        },
        {
            field: 'anoCarroceria',
            label: 'Ano da carroceria',
        },
        {
            field: 'cores',
            label: 'Cores',
        }]
]



const vistoria = [
    {
        field: 'peso_dianteiro',
        label: 'Peso Dianteiro (kg)',
        margin: 'normal',
        type: 'number',
        max: 12000
    },
    {
        field: 'peso_traseiro',
        label: 'Peso Traseiro (kg)',
        margin: 'normal',
        type: 'number',
        max: 15000
    },
]


const certificate = [{
    field: 'utilizacao',
    label: 'Utilização',
    margin: 'normal',
    select: true,
    options: ['Convencional', 'Executivo', 'Leito', 'Semi-Leito', 'Urbano']
},


{
    field: 'anoChassi',
    label: 'Ano do Chassi',
    margin: 'normal',
    type: 'number',
    max: Number(new Date().getFullYear()),
    min: Number(new Date().getFullYear()) - 10
},
{
    type: 'number',
    field: 'anoCarroceria',
    label: 'Ano da Carroceria',
    margin: 'normal',
    max: Number(new Date().getFullYear() + 1),
    min: Number(new Date().getFullYear()) - 10
},
{
    field: 'valorCarroceria',
    label: 'Valor da Carroceria (R$)',
    margin: 'normal',
    zero: true,
    pattern: '\\d{5,14}',
    min: 50000,
    maxLength: 14
},
{
    field: 'dominio',
    label: 'Situação da Propriedade',
    margin: 'normal',
    select: true,
    options: ['Veículo próprio', 'Leasing', 'Possuidor']
}
]