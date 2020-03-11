export const delegatario = [[
    {
        field: 'empresa',
        label: 'Delegatário',
        width: '120mm',
        left: '50mm'
    },
    {
        type: 'date',
        field: 'vencimentoContrato',
        label: 'Validade do Contrato',
        width: '36mm',
        left: '5mm'
    },
]]

export const caracteristicas = [
    [
        {
            field: 'placa',
            label: 'Placa',
            width: '25mm',
            left: '8mm'
        },
        {
            field: 'renavam',
            label: 'Renavam',
            width: '42mm',
            left: '14mm'
        },
        {
            field: 'poltronas',
            label: 'Poltronas',
            width: '16mm',
            left: '2mm'
        },
        {
            field: 'piquesPoltrona',
            label: 'Piques poltrona',
            width: '19mm'
        },
        {
            field: 'nChassi',
            label: 'Número do Chassi',
            width: '50mm',
            left: '15mm'
        },

    ],
    [
        {
            field: 'marcaChassi',
            label: 'Marca do Chassi',
            width: '49mm',
            left: '15mm'
        },
        {
            field: 'modeloChassi',
            label: 'Modelo do Chassi',
            width: '49mm',
            left: '15mm'
        },
        {
            field: 'anoChassi',
            label: 'Ano do chassi',
        },
        {
            field: 'distanciaMinima',
            label: 'Distância Mínima (cm)',
        },
        {
            field: 'distanciaMaxima',
            label: 'Distância Máxima (cm)'
        }
    ],
    [
        {
            field: 'marcaCarroceria',
            label: 'Marca da Carroceria',
            width: '49mm',
            left: '15mm'
        },
        {
            field: 'modeloCarroceria',
            label: 'Modelo da Carroceria',
            width: '49mm',
            left: '15mm'
        },
        {
            field: 'anoCarroceria',
            label: 'Ano da carroceria',
        },
        {
            field: 'cores',
            label: 'Cores',
            width: '45mm',
            left: '15mm'
        }]
]

export const seguro = [[
    {
        field: 'seguradora',
        label: 'Seguradora',
        width: '75mm',
        left: '27.5mm'
    },
    {
        field: 'apolice',
        label: 'Apólice',
        width: '35mm',
        left: '13mm'
    },
    {
        type: 'date',
        field: 'dataEmissao',
        label: 'Data de Emissão',
        width: '25mm',
        left: '5mm'
    },
    {
        type: 'date',
        field: 'vencimento',
        label: 'Vencimento',
        width: '25mm',
        left: '5mm'
    }]]

export const pesagem = [[
    {
        field: 'eixos',
        label: 'Nº Eixos',
        width: '15mm',
        left: '2mm'
    },
    {
        field: 'pbt',
        label: 'Peso Bruto Total',
        width: '25mm',
        left: '5mm'
    },
    {
        field: 'pesoDianteiro',
        label: 'Peso Dianteiro (kg)',
        width: '28mm',
        left: '4mm'
    },
    {
        field: 'pesoTraseiro',
        label: 'Peso Traseiro (kg)',
        width: '28mm',
        left: '4mm'
    },
    {
        field: 'pbt',
        label: 'Peso Bruto Total',
        width: '25mm',
        left: '5mm'
    },
    {
        field: 'pesoPassageiros',
        label: 'Passag/Bagagem',
        width: '25mm',
        left: '3mm'
    },
]]


export const informacoesGerais = [[
    {
        type: 'date',
        field: 'dataRegistro',
        label: 'Data de Registro',
        width: '35mm',
        left: '9mm'
    },
    {
        field: 'dataExpedicao',
        label: 'Data de expedição',
        width: '35mm',
        left: '9mm'
    },
    {
        field: 'utilizacao',
        label: 'Utilização',
        width: '35mm',
        left: '9mm'
    },
    {
        field: 'equipamentosId',
        label: 'Acessórios',
        width: '65mm',
    }
]]

export const other = [[
    {
        field: 'compartilhado', 
        label: 'Empresas autorizadas a compartilhar',
        width: '120mm',
        left: '20mm'
    },
    {
        field: 'observacoes', 
        label: 'Observações',
        width: '80mm',        
    }
]]