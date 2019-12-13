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
    maxLength: 20,
    pattern: '((([+][0-9]{1,3})?[ ]?[-]?[(]?[0-9]{2,3}[)]?[ ]?[-]?[0-9]{4,5}[ ]?[-]?[0-9]{4}))'
},
{
    field: 'emailProcurador',
    label: 'E-mail',
    type: 'email',
    maxLength: 60,
    pattern: '[a-zA-Z0-9]@([a-zA-Z0-9])?[.]([a-zA-Z0-9])'
},
{
    field: 'vencimento',
    label: 'Vigência da procuração',
    type: 'date'    
}
]