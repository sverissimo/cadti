const avisoInputs = [
    {
        label: 'De',
        field: 'from',
        disabled: true
    },
    {
        label: 'Para',
        field: 'to',
        autoComplete: true,
        collection: 'empresas',
        itemProp: 'razaoSocial'
    },
    {
        label: 'Assunto',
        field: 'subject'
    }
]

export default avisoInputs
