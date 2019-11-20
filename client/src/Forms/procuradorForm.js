export const procuradorForm = [{
    field: 'nomeProcurador',
    label: 'Nome do Procurador',
    maxLength: 90,
},
{
    field: 'cpfProcurador',
    label: 'CPF',
    maxLength: 11,
    pattern: '\\d{11}'  
},
{
    field: 'telProcurador',
    label: 'Telefone',    
    type: 'tel',    
    maxLength: 20
    //pattern: '?[(]/d{2-3}?[)]?[ ]/d{4}?[-]/d{4}'
},
{
    field: 'emailProcurador',
    label: 'E-mail',
    type: 'e-mail',
    maxLength: 60
},
{
    field: 'dataFim',
    label: 'Vigência da procuração',
    type: 'date'    
}
]