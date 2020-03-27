const fieldParser = [

    {
        collection: 'veiculos',      
        label: 'Veículos',
        name: 'veiculoId',
        column: 'veiculo_id',
        table: 'veiculo'
    },
    {
        collection: 'seguros',      
        label: 'Seguros',
        name: 'apolice',
        column: 'apolice',
        table: 'seguro'
    },
    {
        collection: 'empresas',      
        label: 'Empresas',
        name: 'delegatarioId',
        column: 'delegatario_id',
        table: 'delegatario'
    },
    {
        collection: 'socios',      
        label: 'Sócios',
        name: 'socioId',
        column: 'socio_id',
        table: 'socios'
    },
    {
        collection: 'procuradores',
        label: 'Procuradores',
        name: 'procuradorId',
        column: 'procurador_id',
        table: 'procurador'
    },
    {
        collection: 'procuracoes',
        label: 'Procurações',
        name: 'procuracaoId',
        column: 'procuracao_id',
        table: 'procuracao'
    },    
    {
        collection: 'equipamentos',
        column: 'item',
        label: 'Equipamentos',
        name: 'equipamentosId',
        table: 'equipamentos'
    },
    {
        collection: 'marcaCarroceria',
        column: 'marca',
        label: 'Marcas de Carroceria',
        name: 'marcaCarroceria',
        table: 'marca_carroceria'
    },
    {
        collection: 'carrocerias',
        column: 'modelo',
        label: 'Modelos de Carroceria',
        name: 'modeloCarroceria',
        table: 'modelo_carroceria'
    },
    {
        collection: 'marcaChassi',
        column: 'marca',
        label: 'Marcas de Chassi',
        name: 'marcaChassi',
        table: 'marca_chassi'
    },
    {
        collection: 'modelosChassi',
        column: 'modeloChassi',
        label: 'Modelos de Chassi',
        name: 'modeloChassi',
        table: 'modelo_chassi'
    },
    {
        collection: 'seguradoras',
        column: 'seguradora',
        label: 'Seguradoras',
        name: 'seguradora',
        table: 'seguradora'
    }
]

module.exports = { fieldParser }