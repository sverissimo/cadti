const width = 225

export const seguroForm = [
    {
        field: 'seguradora',
        label: 'Seguradora',
        autoComplete: true,
        datalist: 'seguradora',
        collection: 'seguradoras',
        maxLength: 80,
        width
    },
    {
        field: 'apolice',
        label: 'Apólice',
        autoComplete: true,
        datalist: 'apolice',
        collection: 'seguros',
        maxLength: 25,
        width
    },
    {
        type: 'date',
        field: 'dataEmissao',
        label: 'Data de Emissão',
        width
    },
    {
        type: 'date',
        field: 'vencimento',
        label: 'Vencimento',
        width
    }]