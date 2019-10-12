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
        datalist: 'razaoSocial',
        autoComplete: true,
        collection: 'empresas'
    },
  
    {
        field: 'utilizacao',
        label: 'Utilização',
        margin: 'normal',
        select: true,
        options: ['Convencional', 'Executivo', 'Leito', 'Semi-Leito', 'Urbano']
    },
    {
        field: 'dominio',
        label: 'Situação da Propriedade',
        margin: 'normal',
        select: true,
        options: ['Veículo próprio', 'Leasing', 'Possuidor']
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