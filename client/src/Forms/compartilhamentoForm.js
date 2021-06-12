const compartilhamentoForm = [
    {
        field: 'placa',
        label: 'Placa',
        datalist: 'placa',
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
        datalist: 'razaoSocial',
        autoComplete: true,
        collection: 'empresas'
    }
]

export default compartilhamentoForm
