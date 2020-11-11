import { cpf, email, phone } from './commonFields'

const width = 195

export const sociosForm = [{
    field: 'nomeSocio',
    label: 'Nome do Sócio',
    maxLength: 90,
    width
},
{
    ...cpf,
    width
},
{
    ...phone,
    field: 'telSocio',
    width
},
{
    ...email,
    field: 'emailSocio',
    width
},
{
    field: 'share',
    label: 'Participação Societária (%)',
    /* pattern: /(^100(,0{1,2})?$)|(^([1-9]([0-9])?|0)(,[0-9]{1,2})?$)/,
    maxLength: 5, */
    type: 'number',
    max: 100,
    width
}
]

