import { cpf } from './commonFields'

export const sociosForm = [{
    field: 'nomeSocio',
    label: 'Nome do Sócio',
    maxLength: 90,
    width: 190
},
{
    ...cpf,
    width: 190
},
{
    field: 'telSocio',
    label: 'Telefone',
    maxLength: 16,
    pattern: '((([+][0-9]{1,3})?[ ]?[-]?[(]?[0-9]{2,3}[)]?[ ]?[-]?[0-9]{4,5}[ ]?[-]?[0-9]{4}))',
    width: 190
},
{
    field: 'emailSocio',
    label: 'E-mail',
    maxLength: 60,
    width: 190
},
{
    field: 'share',
    label: 'Participação Societária (%)',
    maxLength: 5,
    type: 'number',
    max: 100,
    width: 190
}]