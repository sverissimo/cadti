export const sociosForm = [{
    field: 'nome',
    label: 'Nome Completo',
    margin: 'normal'    
},
{
    field: 'cpf',
    label: 'CPF',
    type: 'number',
    margin: 'normal',    
},
{
    field: 'telefone',
    label: 'Telefone',
    margin: 'normal',
    type: 'number',
    pattern: '?[(]\d{2-3}?[)]?[ ]\d{4}?[-]\d{4}'    
},
{
    field: 'email',
    label: 'E-mail',
    margin: 'normal',    
},
{
    field: 'share',
    label: 'Participacao Societária (%)',
    type: 'number',
    margin: 'normal',    
}]