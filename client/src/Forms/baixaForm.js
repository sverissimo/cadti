export const baixaForm = [
    {
        field: 'placa',
        label: 'Placa',
        margin: 'normal',        
        datalist: 'placa',
        autoComplete: true,
        collection: 'frota'
    },
    {
        field: 'renavam',
        label: 'Renavam',
        margin: 'normal',  
    },
    {
        field: 'nChassi',
        label: 'Número do Chassi',
        margin: 'normal',
        maxLength: 17,  
    },
    {
        field: 'delegatario',
        label: 'Delegatário',
        margin: 'normal',        
        disabled: true
    },  
    {
        field: 'utilizacao',
        label: 'Utilização',
        margin: 'normal',        
        disabled: true       
    },
    {
        field: 'dominio',
        label: 'Situação da Propriedade',
        margin: 'normal',                
        disabled: true  
    },
    
    {
        field: 'marcaChassi',
        label: 'Marca do Chassi',
        margin: 'normal',
        disabled: true    
    },
    {
        field: 'modeloChassi',
        label: 'Modelo do Chassi',
        margin: 'normal',
        disabled: true    
    },
    {
        field: 'marcaCarroceria',
        label: 'Marca da Carroceria',
        margin: 'normal',
        disabled: true      
    },
    {
        field: 'modeloCarroceria',
        label: 'Modelo da Carroceria',
        margin: 'normal',
        disabled: true      
    },
    {
        type: 'number',
        field: 'indicadorIdade',
        label: 'Ano',
        margin: 'normal',        
        disabled: true  
    }
]