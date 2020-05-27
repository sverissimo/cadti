import { cpf, email, phone } from './commonFields'

export const procuradorForm = [{
    field: 'nomeProcurador',
    label: 'Nome do Procurador',
    maxLength: 90,
    width: 235
},
{
    ...cpf,
    field: 'cpfProcurador',
    width: 235
},
{
    ...phone,
    field: 'telProcurador',    
    width: 235
},
{
    ...email,
    field: 'emailProcurador',
    width: 235
}]