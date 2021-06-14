export const seguroForm = [
    {
        field: 'seguradora',
        label: 'Seguradora',
        autoComplete: true,
        collection: 'seguradoras',
        width: 150
    },
    {
        field: 'apolice',
        label: 'Apólice',
        autoComplete: true,
        collection: 'seguros',
        maxLength: 25,
        width: 150
    },
    {
        type: 'date',
        field: 'dataEmissao',
        label: 'Início da vigência',
        width: 150
    },
    {
        type: 'date',
        field: 'vencimento',
        label: 'Vencimento',
        width: 150
    }]