import moment from 'moment'
import { stringBR } from '../Veiculos/checkWeight'

export const delegatario = [[
    {
        field: 'empresa',
        label: 'Delegatário',
        width: '95mm',
        left: '50mm'
    },
    {
        field: 'codigoEmpresa',
        label: 'Código do Delegatário',
        width: '18mm',
    },
    {
        field: 'dataExpedicaoCRV',
        label: 'Data de emissão',
        width: '20mm',
        value: moment().format('DD/MM/YYYY')
    },
    {
        field: 'vencimento',
        label: 'Validade do CRV',
        type: 'date',
        width: '20mm',
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
        field: 'cmt',
        label: 'PBT / CMT Legal (t)',
        width: '27mm',
        left: '2mm',
        format: float => stringBR(float)
    },
    {
        field: 'pesoDianteiro',
        label: 'Peso Dianteiro (t)',
        width: '27mm',
        left: '3.5mm',
        format: float => stringBR(float)
    },
    {
        field: 'pesoTraseiro',
        label: 'Peso Traseiro (t)',
        width: '27mm',
        left: '3.5mm',
        format: float => stringBR(float)
    },
    {
        field: 'pbt',
        label: 'Peso Bruto Total (t)',
        width: '30mm',
        left: '4mm',
        format: float => stringBR(float)
    },
    {
        field: 'pesoPassageiros',
        label: 'Passag/Bagagem (t)',
        width: '30mm',
        left: '3mm',
        format: float => stringBR(float)
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
    {
        field: 'cores',
        label: 'Cores',
        width: '65mm',
        left: '15mm'
    },
    {
        field: 'compartilhado',
        label: 'Empresa autorizada a compartilhar',
        width: '90mm',
        left: '11mm'
    }
]]
