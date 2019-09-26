import { vistoriaForm } from './vistoriaForm'
import { seguroForm } from './seguroForm'

export const cadForm = [[{
    field: 'placa',
    label: 'Placa',
    margin: 'normal',
    maxLength: 8,
    pattern: '[a-zA-Z]{3}[-]?\\d{4}'
},
{
    field: 'renavam',
    label: 'Renavam',
    margin: 'normal',
    maxLength: 11,
    pattern: '\\d{11}'
},
{
    field: 'utilizacao',
    label: 'Utilização',
    margin: 'normal',
    select: true,
    options: ['Convencional', 'Executivo', 'Leito', 'Semi-Leito', 'Urbano']
},
{
    field: 'nChassi',
    label: 'Número do Chassi',
    margin: 'normal',
    maxLength: 17
},
{
    field: 'modeloChassi',
    label: 'Modelo do Chassi',
    margin: 'normal',
    datalist: 'modeloChassi',
    autoComplete: true,
    collection: 'modelosChassi'
},
{
    field: 'anoChassi',
    label: 'Ano do Chassi',
    margin: 'normal',
    type: 'number',
    max: 2020
},
{
    type: 'number',
    field: 'valorChassi',
    label: 'Valor do Chassi (R$)',
    margin: 'normal',
    zero: true
},
{
    field: 'modeloCarroceria',
    label: 'Modelo da Carroceria',
    margin: 'normal',
    datalist: 'modelo',
    autoComplete: true,
    collection: 'carrocerias'
},
{
    type: 'number',
    field: 'anoCarroceria',
    label: 'Ano da Carroceria',
    margin: 'normal',
    max: 2020
},
{
    type: 'number',
    field: 'valorCarroceria',
    label: 'Valor da Carroceria (R$)',
    margin: 'normal',
    zero: true
},
{
    field: 'dominio',
    label: 'Situação da Propriedade',
    margin: 'normal',
    select: true,
    options: ['Veículo próprio', 'Leasing', 'Possuidor']
},
{
    field: 'cores',
    label: 'Cores',
    margin: 'normal'
}
]]
    .concat([seguroForm])
    .concat([vistoriaForm])
    .concat([[]])
    .concat([[]])