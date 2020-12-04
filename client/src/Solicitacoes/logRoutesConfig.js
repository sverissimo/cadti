const vehicle = {

    collection: 'logs',
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
        subject: 'Reativação de veículo',
        path: '/solicitacoes/cadastro',
        requestAction: 'Reativação de veículo solicitada',
        responseAction: 'Pendências para a reativação do veículo',
        concludedAction: 'Veículo reativado',
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
        ...vehicle,
        subject: 'Cadastro/alteração de seguro',
        path: '/solicitacoes/seguros',
        requestAction: 'Cadastro de seguro solicitado',
        responseAction: 'Pendências para o cadastro do seguro',
        concludedAction: 'Seguro cadastrado',
        primaryKey: 'id',
        collection, docs,

    },
    {
        ...vehicle,
        subject: 'Cadastro de laudo de segurança veicular',
        collection: 'logs',
        path: '/solicitacoes/laudos',
        requestAction: 'Cadastro do laudo solicitado',
        responseAction: 'Pendências para o cadastro do laudo',
        concludedAction: 'Laudo veicular cadastrado',
    },
    {
        subject: 'Baixa de veículo',
        path: '/solicitacoes/baixaVeiculo',
        collection, docs, primaryKey,
    },
    {
        subject: 'Configurações de Veículo',
        collection: 'logs',
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
        subject: 'Alteração no quadro/dados de sócios',
        requestAction: 'Alteração no quadro/dados de sócios solicitada',
        concludedAction: 'Alteração de sócios cadastrada',
        path: '/solicitacoes/socios',
        docs: 'empresaDocs',
        primaryKey: 'empresaId',
        collection
    },
    {
        subject: 'Alteração estatutária',
        requestAction: 'Alteração estatutária solicitada',
        responseAction: 'Pendências para a alteração estatutária',
        concludedAction: 'Alteração estatutária cadastrada',
        path: '/solicitacoes/altContrato',
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
        concludedAction: 'Procuração cadastrada',
    },
]












