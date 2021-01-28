import { cpf, email, phone } from './commonFields'

const width = 195

export const sociosForm = [{
    field: 'nomeSocio',
    label: 'Nome do Sócio',
    maxLength: 90,
    width,
    disabled: true
},
{
    ...cpf,
    width,
    disabled: true
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
    type: 'number',
    width
}
]

