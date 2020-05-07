export const laudoForm = [
    {
        field: 'id',
        label: 'Número do laudo',              
        maxLength: 30
    },
    {
        field: 'validade',
        label: 'Data de validade',
        type: 'date'
    },
    {
        field: 'empresaLaudo',
        label: 'Empresa emissora',        
        select: true
    },    
]