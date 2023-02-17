const width = '240px'
export const altContratoForm = [
    {
        field: 'numeroAlteracao',
        label: 'Número da alteração',
        maxLength: 3,
        pattern: '^\\d{1,3}$',
        width
    },
    {
        field: 'numeroRegistro',
        label: 'Registro na junta comercial',
        maxLength: 40,
        width
    },
    {
        field: 'numeroSei',
        label: 'Número do registro SEI (se houver)',
        maxLength: 30,
        required: false,
        width
    },
    {
        field: 'dataJunta',
        label: 'Data de registro na Junta Comercial',
        type: 'date',
        required: false,
        width
    },
    {
        field: 'vencimentoContrato',
        label: 'Vencimento do Cadastro - CRC',
        type: 'date',
    }
]
