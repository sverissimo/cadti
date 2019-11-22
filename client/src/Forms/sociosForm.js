export const sociosForm = [{
    field: 'nomeSocio',
    label: 'Nome do Sócio',
    maxLength: 90
},
{
    field: 'cpfSocio',
    label: 'CPF',    
    maxLength: 11,
    pattern: '\\d{11}' 
},
{
    field: 'telSocio',
    label: 'Telefone',
    maxLength: 16,    
    pattern: '((([+][0-9]{1,3})?[ ]?[-]?[(]?[0-9]{2,3}[)]?[ ]?[-]?[0-9]{4,5}[ ]?[-]?[0-9]{4}))'
},
{
    field: 'emailSocio',
    label: 'E-mail',
    maxLength: 60
},
{
    field: 'share',
    label: 'Participação Societária (%)',
    maxLength: 5,    
    max: 100,    
}]