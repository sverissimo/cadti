export const seguroForm = [
    {
        field: 'seguradora',
        label: 'Seguradora',
        margin: 'normal',
        autoComplete: true,
        datalist: 'seguradora',
        collection: 'seguradoras'
    },
    {       
        field: 'apolice',
        label: 'Apólice',
        margin: 'normal',
        autoComplete: true,
        datalist: 'apolice',
        collection: 'seguros',
        maxLength: 25
    },    
    {
        type: 'date',
        field: 'dataEmissao',
        label: 'Data de Emissão',
        margin: 'normal',
    },
    {
        type: 'date',
        field: 'vencimento',
        label: 'Vencimento',
        margin: 'normal',
    }]