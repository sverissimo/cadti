export const procuradorEmpresaTable = [
    {
        field: 'nomeProcurador',
        title: 'Nome',
    },
    {
        field: 'cpfProcurador',
        title: 'CPF',
    },
    {
        field: 'emailProcurador',
        title: 'E-mail'
    },
    {
        field: 'telProcurador',
        title: 'Telefone'
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

