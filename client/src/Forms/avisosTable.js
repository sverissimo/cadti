const avisosTable = [
    {
        field: 'vocativo',
        label: 'Destinatário',
    },
    {
        field: 'subject',
        label: 'Assunto',
    },
    {
        field: 'read',
        label: 'Lida',
    },
    {
        field: 'createdAt',
        label: 'Data de criação do aviso',
        type: 'date',
        format: value => value ? value : 'Nenhuma data informada'
    },
]

export default avisosTable