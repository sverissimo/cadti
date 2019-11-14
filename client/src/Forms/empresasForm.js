export const empresasForm = [{
    field: 'razaoSocial',
    label: 'Razão Social',
    margin: 'normal'    
},
{
    field: 'cnpj',
    label: 'CNPJ',
    margin: 'normal',    
},
{
    field: 'inscricaoEstadual',
    label: 'Inscrição Estadual',
    margin: 'normal',    
},
{
    field: 'telefone',
    label: 'Telefone',
    margin: 'normal',
    pattern: '?[(]\d{2-3}?[)]?[ ]\d{4}?[-]\d{4}'    
},
{
    field: 'email',
    label: 'E-mail',
    margin: 'normal',    
},
{
    field: 'cep',
    label: 'CEP',
    margin: 'normal',
    type: 'number',    
    maxLength: 10
},
{    
    field: 'numero',
    label: 'Número',
    type: 'number',
    margin: 'normal',    
},
{
    field: 'complemento',
    label: 'Complemento',
    margin: 'normal',    
},
{    
    field: 'rua',
    label: 'Rua',
    margin: 'normal',    
},
{    
    field: 'bairro',
    label: 'Bairro',
    margin: 'normal',    
},
{
    field: 'cidade',
    label: 'Cidade',
    margin: 'normal',    
},
{
    field: 'uf',
    label: 'Estado',
    margin: 'normal',
    maxLength: 2
}
]