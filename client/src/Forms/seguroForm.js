export const seguroForm = [
    {
        field: 'seguradoraId',
        label: 'Seguradora',
        margin: 'normal',
        autoComplete: true,
        datalist: 'seguradora',
        collection: 'seguradoras'
    },
    {       
        field: 'seguroId',
        label: 'Apólice',
        margin: 'normal',
        autoComplete: true,
        datalist: 'apolice',
        collection: 'seguros'
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