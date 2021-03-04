import { cpf, email, phone } from './commonFields'

export const procuradorConsultasForm = [{
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
},
{
    field: 'createdAt',
    label: 'Data de inclusão no sistema',
    type: 'date',
    width: 220
}
]