export const configVehicleForm = [

    {
        collection: 'equipamentos',
        field: 'item',
        label: 'Equipamentos',
        name: 'equipamentosId',
        table: 'equipamentos'
    },
    {
        collection: 'acessibilidade',
        field: 'item',
        label: 'Itens de acessibilidade',
        name: 'acessibilidadeId',
        table: 'acessibilidade'
    },
    {
        collection:'marcaCarroceria',
        field: 'marca',
        label: 'Marcas de Carroceria',
        name:'marcaCarroceria',
        table: 'marca_carroceria'
    },
    {
        collection: 'carrocerias',
        field: 'modelo',
        label: 'Modelos de Carroceria',
        name:'modeloCarroceria',
        table: 'modelo_carroceria'
    },
    {
        collection: 'marcaChassi',
        field: 'marca',
        label: 'Marcas de Chassi',
        name: 'marcaChassi',
        table: 'marca_chassi'
    },
    {
        collection: 'modelosChassi',
        field: 'modeloChassi',
        label: 'Modelos de Chassi',
        name: 'modeloChassi',
        table: 'modelo_chassi'
    },
    {
        collection: 'seguradoras',
        field: 'seguradora',
        label: 'Seguradoras',
        name: 'seguradora',
        table: 'seguradora'
    },
    {
        collection: 'laudos',        
        table: 'laudos'
    }

]