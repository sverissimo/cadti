const solicitacaoTable = [

    {
        field: 'action',
        title: 'Movimentação',
    },
    {
        field: 'user',
        title: 'Usuário'
    },
    {
        field: 'createdAt',
        title: 'Registro no sistema',
        type: 'date'
    },
    {
        field: 'info',
        title: 'Informações adicionais',
        action: 'info',
        style: {textAlign: 'center'}
    },
   /*  {
        field: 'files',
        title: 'Arquivos',
        action: 'getFile',
        style: {textAlign: 'center'}
    } */
]

export default solicitacaoTable