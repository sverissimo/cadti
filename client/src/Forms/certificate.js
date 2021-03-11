export const delegatario = [[
    {
        field: 'empresa',
        label: 'Delegatário',
        width: '120mm',
        left: '50mm'
    },
    {
        field: 'codigoEmpresa',
        label: 'Código do Delegatário',
        width: '36mm',
        left: '5mm'
    },
]]

export const dadosVeiculo = [[
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
        field: 'utilizacao',
        label: 'Utilização',
        width: '35mm',
        left: '11mm'
    },
    {
        field: 'nChassi',
        label: 'Número do Chassi',
        width: '50mm',
        left: '15mm'
    },
]]

export const caracteristicas = [
    [

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
            field: 'distanciaMinima',
            label: 'Distância Mínima (cm)',
        },
        {
            field: 'distanciaMaxima',
            label: 'Distância Máxima (cm)'
        },
        {
            field: 'eixos',
            label: 'Eixos',
            width: '12mm',
            left: '2mm'
        },
        {
            field: 'pneumaticosDianteiro',
            label: 'Pneumáticos Dianteiro'
        },
        {
            field: 'pneumaticosTraseiro',
            label: 'Pneumáticos Traseiro'
        },
        {
            field: 'potencia',
            label: 'Potência (cv)',
            width: '15mm',
        }
    ],
    [
        {
            field: 'marcaChassi',
            label: 'Marca do Chassi',
            width: '40mm',
            left: '4mm'
        },
        {
            field: 'modeloChassi',
            label: 'Modelo do Chassi',
            width: '40mm',
            left: '3mm'
        },
        {
            field: 'anoChassi',
            label: 'Ano do chassi',
        }
        ,
        {
            field: 'marcaCarroceria',
            label: 'Marca da Carroceria',
            width: '40mm',
            left: '2mm'
        },
        {
            field: 'modeloCarroceria',
            label: 'Modelo da Carroceria',
            width: '40mm',
            left: '1mm'
        },
        {
            field: 'anoCarroceria',
            label: 'Ano da carroceria',
        }

    ]
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
        left: '11mm'
    },
    {
        type: 'date',
        field: 'dataEmissao',
        label: 'Início de vigência',
        width: '25mm',
    },
    {
        type: 'date',
        field: 'vencimento',
        label: 'Vencimento',
        width: '25mm',
        left: '5mm'
    }]]

export const vistoria = [[
    {
        field: 'numeroLaudo',
        label: 'Número do Laudo',
        width: '45mm',
        left: '10mm'
    },
    {
        field: 'empresaLaudo',
        label: 'Empresa Responsável',
        width: '80mm',
        left: '26mm'
    },
    {
        field: 'vencimentoLaudo',
        label: 'Vencimento',
        type: 'date',
        width: '35mm',
        left: '9mm'
    },
]]

export const pesagem = [[
    {
        field: 'eixos',
        label: 'Nº Eixos',
        width: '15mm',
        left: '2mm'
    },
    {
        field: 'cmt',
        label: 'PBT / CMT Legal',
        width: '25mm'
    },
    {
        field: 'pesoDianteiro',
        label: 'Peso Dianteiro (t)',
        width: '28mm',
        left: '4mm'
    },
    {
        field: 'pesoTraseiro',
        label: 'Peso Traseiro (t)',
        width: '28mm',
        left: '4mm'
    },
    {
        field: 'pbt',
        label: 'Peso Bruto Total (t)',
        width: '25mm'
    },
    {
        field: 'pesoPassageiros',
        label: 'Passag/Bagagem (t)',
        width: '25mm',
        left: '3mm'
    }
]]


export const informacoesGerais = [[
    {
        field: 'dataRegistro',
        label: 'Data de Registro',
        type: 'date',
        width: '30mm',
        left: '4mm'
    },
    /* {
        field: 'dataExpedicao',
        label: 'Data de expedição do CRV',
        type: 'date',
        width: '30mm',
    }, */
    {
        field: 'venciment',
        label: 'Validade do CRV',
        type: 'date',
        width: '25mm',
    },
    {
        field: 'cores',
        label: 'Cores',
        width: '50mm',
        left: '15mm'
    },
    {
        field: 'compartilhado',
        label: 'Empresa autorizada a compartilhar',
        width: '80mm',
        left: '20mm'
    }
]]

export const compartilhado = [[
    {
        field: 'compartilhado',
        label: 'Empresas autorizadas a compartilhar',
        width: '120mm',
        left: '20mm'
    }
]]