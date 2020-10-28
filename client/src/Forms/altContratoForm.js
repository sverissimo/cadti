const width = '240px'
export const altContratoForm = [
    {
        field: 'numeroAlteracao',
        label: 'Número da alteração',
        maxLength: 50,
        width
    },
    {
        field: 'numeroRegistro',
        label: 'Número do registro na junta comercial',
        maxLength: 30,
        width
    },
    {
        field: 'numeroSei',
        label: 'Número do registro SEI (se houver)',
        maxLength: 30,
        width
    },
    {
        field: 'dataJunta',
        label: 'Data de registro na Junta Comercial',
        type: 'date',
        width
    }
]