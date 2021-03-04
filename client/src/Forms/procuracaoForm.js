export const procuracaoForm = [{
    field: 'razaoSocial',
    title: 'Empresa',
    maxLength: 90,
    width: 220
},
{
    field: 'codigoEmpresa',
    title: 'Código da empresa',
    width: 220
},
{
    field: 'status',
    title: 'Status',
    width: 220
},
{
    field: 'vencimento',
    title: 'Validade da procuração',
    type: 'date',
    format: value => value ? value : 'Prazo indeterminado'
},
{
    field: 'fileId',
    title: 'Baixar Procuração',
    type: 'link'
},
]