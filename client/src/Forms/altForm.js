import { altFormVistoria } from './altFormVistoria'

export const altForm = [[{
    field: 'placa',
    label: 'Placa',
    autoComplete: true,
    collection: 'frota',
},
{
    field: 'delegatario',
    label: 'Delegatário',
    itemProp: 'razaoSocial',
    autoComplete: true,
    collection: 'empresas'
},
{
    field: 'compartilhado',
    label: 'Delegatário Compartilhado',
    itemProp: 'razaoSocial',
    autoComplete: true,
    collection: 'compartilhados'
},
{
    field: 'utilizacao',
    label: 'Utilização',
    margin: 'normal',
    select: true,
    options: ['Comercial', 'Comercial Executivo', 'Convencional', 'Convencional Executivo', 'Leito', 'Leito e Executivo', 'Semi-Leito', 'Semi-Leito Executivo']
},
{
    field: 'dominio',
    label: 'Situação da Propriedade',
    margin: 'normal',
    select: true,
    options: ['Veículo próprio', 'Alienação Fiduciária', 'Leasing', 'Possuidor']
},
{
    field: 'cores',
    label: 'Cores',
    margin: 'normal',
    maxLength: 50
},
{
    field: 'renavam',
    label: 'Renavam',
    margin: 'normal',
    disabled: true
},
{
    field: 'nChassi',
    label: 'Número do Chassi',
    margin: 'normal',
    maxLength: 17,
    disabled: true
},
{
    field: 'modeloChassi',
    label: 'Modelo do Chassi',
    margin: 'normal',
    disabled: true
},
{
    field: 'anoChassi',
    label: 'Ano do Chassi',
    margin: 'normal',
    type: 'number',
    disabled: true
},
{
    field: 'valorChassi',
    label: 'Valor do Chassi (R$)',
    margin: 'normal',
    zero: true,
    disabled: true
},
{
    field: 'modeloCarroceria',
    label: 'Modelo da Carroceria',
    margin: 'normal',
    disabled: true
},
{
    type: 'number',
    field: 'anoCarroceria',
    label: 'Ano da Carroceria',
    margin: 'normal',
    disabled: true
},
{
    field: 'valorCarroceria',
    label: 'Valor da Carroceria (R$)',
    margin: 'normal',
    zero: true,
    disabled: true
},

]]
    .concat([altFormVistoria])
    .concat([[]])
    .concat([[]])