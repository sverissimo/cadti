export const seguroForm = [
    {
        field: 'seguradora',
        label: 'Seguradora',        
        autoComplete: true,
        datalist: 'seguradora',
        collection: 'seguradoras'
    },
    {       
        field: 'apolice',
        label: 'Apólice',        
        autoComplete: true,
        datalist: 'apolice',
        collection: 'seguros',
        maxLength: 25
    },    
    {
        type: 'date',
        field: 'dataEmissao',
        label: 'Data de Emissão',        
    },
    {
        type: 'date',
        field: 'vencimento',
        label: 'Vencimento',        
    }]