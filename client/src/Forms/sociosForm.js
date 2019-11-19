export const sociosForm = [{
    field: 'nomeSocio',
    label: 'Nome do Sócio',
    margin: 'normal'    
},
{
    field: 'cpfSocio',
    label: 'CPF',
    type: 'number',
    margin: 'normal',    
},
{
    field: 'telSocio',
    label: 'Telefone',
    margin: 'normal',
    type: 'number',
    pattern: '?[(]/d{2-3}?[)]?[ ]/d{4}?[-]/d{4}'    
},
{
    field: 'emailSocio',
    label: 'E-mail',
    margin: 'normal',    
},
{
    field: 'share',
    label: 'Participação Societária (%)',
    type: 'number',
    margin: 'normal'    
}]