export const laudoForm = [
    {
        field: 'id',
        label: 'Número',      
        datalist: 'placa',
        autoComplete: true,
        collection: 'frota',
        maxLength: 8
    },
    {
        field: 'renavam',
        label: 'Renavam',        
    },
    {
        field: 'nChassi',
        label: 'Número do Chassi',        
        maxLength: 17,
    },
    {
        field: 'delegatario',
        label: 'Delegatário',        
        disabled: true
    },
    {
        field: 'utilizacao',
        label: 'Utilização',        
        disabled: true
    }
]