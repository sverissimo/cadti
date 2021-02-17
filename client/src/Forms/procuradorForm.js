import { cpf, email, phone } from './commonFields'

export const procuradorForm = [{
    field: 'nomeProcurador',
    label: 'Nome do Procurador',
    maxLength: 90,
    width: 240
},
{
    ...cpf,
    field: 'cpfProcurador',
    width: 240
},
{
    ...phone,
    field: 'telProcurador',
    width: 240
},
{
    ...email,
    field: 'emailProcurador',
    width: 240
},
{
    field: 'createdAt',
    label: 'Data de inclusão no sistema',
    type: 'date',
    width: 240
},
{
    field: 'nomeEmpresas',
    label: 'Empresas',
    width: 240
}
]