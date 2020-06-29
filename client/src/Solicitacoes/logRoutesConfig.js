export const logRoutesConfig = [
    {
        subject: 'Cadastro de veículo',
        collection: 'vehicleLogs',        
        path: '/veiculos/cadastro'        
    },
    {
        subject: 'Alteração de dados do veículo',                
        path: '/solicitacoes/altDados',        
        primaryKey: 'veiculoId',
        requestAction: 'Alteração de dados de veículo solicitada',
        responseAction: 'Pendências para a alteração de dados veicular',
        concludedAction: 'Dados do veículo alterados'            
    },
    {
        subject: 'Cadastro ou alteração de seguro',
        collection: 'vehicleLogs',
        path: '/veiculos/altSeguro',        
    },
    {
        subject: 'Cadastro de laudo de segurança veicular',
        collection: 'vehicleLogs',
        path: '/veiculos/laudos',        
    },
    {        
        subject: 'Baixa de veículo',        
        primaryKey: 'veiculoId',
        path: '/solicitacoes/baixaVeiculo'        
    },
    {
        subject: 'Configurações de Veículo',
        collection: 'vehicleLogs',
        path: '/veiculos/config'
    },
    {
        subject: 'Consultas',
        path: '/consultas'
    },
    {
        subject: 'Cadastro de empresa',
        collection: 'empresaLogs',
        path: '/empresas/cadastro'
    },
    {
        subject: 'Cadastro ou alteração societária',
        collection: 'empresaLogs',
        path: '/empresas/socios'
    },
    {
        subject: 'Cadastro de procurações/procuradores',
        collection: 'empresaLogs',
        path: '/empresas/procuradores'
    },
]












