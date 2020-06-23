export const solRoutes = [
    {
        subject: 'Baixa',
        path: '/solicitacoes/baixaVeiculo'
    },
    {
        subject: 'Alteração',
        path: '/solicitacoes/altDados',
        requestAction: 'Alteração de dados de veículo solicitada',
        responseAction: 'Pendências para a alteração de dados veicular',
        concludedAction: 'Dados do veículo alterados'            
    }
]