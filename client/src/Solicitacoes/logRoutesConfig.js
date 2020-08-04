const vehicle = {
    
    collection: 'vehicleLogs',
    docs: 'vehicleDocs',
    primaryKey: 'veiculoId'
}

const { collection, docs, primaryKey } = vehicle

export const logRoutesConfig = [
    {
        subject: 'Cadastro de veículo',
        path: '/solicitacoes/cadastro',
        requestAction: 'Cadastro de veículo solicitado',
        responseAction: 'Pendências para o cadastro do veículo',
        concludedAction: 'Veículo cadastrado',
        collection, docs, primaryKey,
    },
    {        
        subject: 'Alteração de dados do veículo',    
        path: '/solicitacoes/altDados',
        requestAction: 'Alteração de dados de veículo solicitada',
        responseAction: 'Pendências para a alteração de dados veicular',
        concludedAction: 'Dados do veículo alterados',
        collection, docs, primaryKey,
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
        path: '/solicitacoes/baixaVeiculo',
        collection, docs, primaryKey,
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
        subject: 'Alteração estatutária',
        requestAction: 'Alteração estatutária solicitada',
        responseAction: 'Pendências para a alteração estatutária',
        concludedAction: 'Alteração estatutária cadastrada',        
        path: '/solicitacoes/socios',
        docs: 'empresaDocs',
        primaryKey: 'empresaId',
        collection
    },
    {
        subject: 'Cadastro de procurações/procuradores',
        collection,
        path: '/solicitacoes/procuradores',
        docs: 'empresaDocs',
        primaryKey: 'empresaId',
        requestAction: 'Cadastro de procuração solicitado',
        responseAction: 'Procuração indeferida',
        concludedAction: 'Alteração estatutária cadastrada',        
    },
]












