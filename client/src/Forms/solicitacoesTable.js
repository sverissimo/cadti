export const solicitacoesTable = [
    {
        field: 'numero',
        title: 'Número',
    },
    {
        field: 'subject',
        title: 'Solicitação',
    },
    {
        field: 'empresa',
        title: 'Empresa',
    },
    {
        field: 'veiculo',
        title: 'Veículo',
    },
    {
        field: 'status',
        title: 'Situação',
    },
    {
        field: 'updatedAt',
        title: 'Última Atualização',
        type: 'date'
    },    
    {
        field: 'history',
        title: 'Ver histórico',        
        action: 'showHistory'
    },
    {
        field: 'assess',
        title: 'Analisar solicitação',
        action: 'assess'
    }  
]
