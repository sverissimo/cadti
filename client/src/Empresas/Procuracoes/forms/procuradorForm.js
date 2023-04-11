import { cpf, email, phone } from '../../../Forms/commonFields'

export const procuradorForm = [{
    field: 'nomeProcurador',
    label: 'Nome do Procurador',
    maxLength: 90,
    width: 220
},
{
    ...cpf,
    field: 'cpfProcurador',
    width: 220
},
{
    ...phone,
    field: 'telProcurador',
    width: 220
},
{
    ...email,
    field: 'emailProcurador',
    width: 220
}
]