const compartilhamentoForm = [
    {
        field: 'placa',
        label: 'Placa',
        autoComplete: true,
        collection: 'frota',
    },
    {
        field: 'renavam',
        label: 'Renavam',
        disabled: true
    },
    {
        field: 'nChassi',
        label: 'Número do Chassi',
        maxLength: 17,
        disabled: true
    },
    {
        field: 'utilizacao',
        label: 'Utilização',
        disabled: true
    },
    {
        field: 'modeloChassi',
        label: 'Modelo do Chassi',
        disabled: true
    },
    {
        field: 'modeloCarroceria',
        label: 'Modelo da Carroceria',
        disabled: true
    },
    {
        field: 'compartilhado',
        label: 'Delegatário Compartilhado',
        itemProp: 'razaoSocial',
        autoComplete: true,
        collection: 'compartilhados'
    }
]

export default compartilhamentoForm
