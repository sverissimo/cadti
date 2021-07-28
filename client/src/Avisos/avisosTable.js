const avisosTable = [
    {
        field: 'vocativo',
        title: 'Destinatário',
    },
    {
        field: 'subject',
        title: 'Assunto',

    },
    {
        field: 'read',
        title: 'Lida',
        hidden: true
    },
    {
        field: 'createdAt',
        title: 'Data de criação do aviso',
        type: 'date',
        format: value => value ? value : 'Nenhuma data informada'
    },
]

export default avisosTable