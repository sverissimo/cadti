import { vistoriaForm } from './vistoriaForm'

export const cadVehicleForm = [[{
    field: 'placa',
    label: 'Placa',
    margin: 'normal',
    maxLength: 8,
    pattern: '[a-zA-Z]{3}[-]?[ ]?\\d{4}|[A-Z]{3}[-]?[ ]?[0-9]{1}[A-Z]{1}[0-9]{2}'
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
    max: Number(new Date().getFullYear()),
    min: Number(new Date().getFullYear()) - 10
},
{ 
    field: 'valorChassi',
    label: 'Valor do Chassi (R$)',
    margin: 'normal',
    zero: true,
    pattern: '^.{9,12}$',
    minLength: 8,    
    maxLength: 11
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
    max: Number(new Date().getFullYear() + 1),
    min: Number(new Date().getFullYear()) - 10
},
{    
    field: 'valorCarroceria',
    label: 'Valor da Carroceria (R$)',
    margin: 'normal',
    zero: true,    
    pattern: '^.{9,12}$',
    minLength: 8,    
    maxLength: 11
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
    margin: 'normal',
    maxLength: 50
}
]]    
    .concat([vistoriaForm])    