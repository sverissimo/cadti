const altContratoTable = [
    {
        field: 'numeroAlteracao',
        label: 'Número da alteração',
    },
    {
        field: 'numeroRegistro',
        label: 'Registro na junta comercial',
    },
    {
        field: 'numeroSei',
        label: 'Número do registro SEI',
    },
    {
        field: 'createdAt',
        label: 'Registro no CadTI',
        type: 'date',
        format: value => value ? value : 'Nenhuma data informada'
    },
    {
        field: 'dataJunta',
        label: 'Data de Registro na Junta Comercial',
        type: 'date',
        format: value => value ? value : 'Nenhuma data informada'
    },
    {
        field: 'fileId',
        label: 'Baixar alteração contratual',
        value: 'Clique para baixar o arquivo',
        type: 'link'
    },
]

export default altContratoTable