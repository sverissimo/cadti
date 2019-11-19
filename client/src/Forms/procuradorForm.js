export const procuradorForm = [{
    field: 'nomeProcurador',
    label: 'Nome do Procurador'    
},
{
    field: 'cpfProcurador',
    label: 'CPF',
    type: 'number',    
},
{
    field: 'telProcurador',
    label: 'Telefone',    
    type: 'number',
    pattern: '?[(]/d{2-3}?[)]?[ ]/d{4}?[-]/d{4}'
},
{
    field: 'emailProcurador',
    label: 'E-mail',    
},
{
    field: 'dataFim',
    label: 'Vigência da procuração',
    type: 'date'    
}
]