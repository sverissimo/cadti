export const seguroForm = [
    {
        field: 'seguradora',
        label: 'Seguradora',        
        autoComplete: true,
        datalist: 'seguradora',
        collection: 'seguradoras',
        width: 225
    },
    {       
        field: 'apolice',
        label: 'Apólice',        
        autoComplete: true,
        datalist: 'apolice',
        collection: 'seguros',
        maxLength: 25,
        width: 225
    },    
    {
        type: 'date',
        field: 'dataEmissao',
        label: 'Início da vigência',
        width: 225
    },
    {
        type: 'date',
        field: 'vencimento',
        label: 'Vencimento',
        width: 225
    }]