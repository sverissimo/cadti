const avisosTable = [
    {
        field: 'vocativo',
        title: 'Destinatário',
        label: 'Destinatário',
    },
    {
        field: 'subject',
        title: 'Assunto',
        label: 'Assunto',
    },
    {
        field: 'read',
        title: 'Lida',
        label: 'Status',
        hidden: true
    },
    {
        field: 'createdAt',
        title: 'Data de criação do aviso',
        label: 'Data de criação do aviso',
        type: 'date',
        format: value => value ? value : 'Nenhuma data informada'
    },
]

export default avisosTable