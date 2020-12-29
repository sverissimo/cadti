export const baixaForm = [
    {
        field: 'placa',
        label: 'Placa',
        datalist: 'placa',
        autoComplete: true,
        collection: 'frota',
        maxLength: 8
    },
    {
        field: 'renavam',
        label: 'Renavam',
    },
    {
        field: 'nChassi',
        label: 'Número do Chassi',
        maxLength: 17,
    },
    {
        field: 'utilizacao',
        label: 'Utilização',
        disabled: true
    },
    {
        field: 'dominio',
        label: 'Situação da Propriedade',
        disabled: true
    },

    {
        field: 'marcaChassi',
        label: 'Marca do Chassi',
        disabled: true
    },
    {
        field: 'modeloChassi',
        label: 'Modelo do Chassi',
        disabled: true
    },
    {
        field: 'marcaCarroceria',
        label: 'Marca da Carroceria',
        disabled: true
    },
    {
        field: 'modeloCarroceria',
        label: 'Modelo da Carroceria',
        disabled: true
    },
    {
        type: 'number',
        field: 'indicadorIdade',
        label: 'Indicador de idade',
        disabled: true
    }
]