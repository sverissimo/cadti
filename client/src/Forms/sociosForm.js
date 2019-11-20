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
    maxLength: 20,
    pattern: '[0-9]{20}'
    //pattern: '?[(]/d{2-3}?[)]?[ ]/d{4}?[-]/d{4}'    
},
{
    field: 'emailSocio',
    label: 'E-mail',
    maxLength: 60
},
{
    field: 'share',
    label: 'Participação Societária (%)',
    maxLength: 3,    
    pattern: '[0-9]{3}'
}]