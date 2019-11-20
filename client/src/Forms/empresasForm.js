export const empresasForm = [{
    field: 'razaoSocial',
    label: 'Razão Social',
    maxLength: 90
},
{
    field: 'cnpj',
    label: 'CNPJ',
    maxLength: 14,
    pattern: '\\d{14}'
},
{
    field: 'inscricaoEstadual',
    label: 'Inscrição Estadual',
    maxLength: 13,
    pattern: '\\d{13}'
},
{
    field: 'telefone',
    label: 'Telefone',
    maxLength: 12,
    pattern: '?[(]/d{2-3}?[)]?[ ]/d{4}?[-]/d{4}',    
},
{
    field: 'email',
    label: 'E-mail',
    type: 'email',
    maxLength: 60,
},
{
    field: 'cep',
    label: 'CEP',       
    maxLength: 10    
},
{    
    field: 'numero',
    label: 'Número',
    type: 'number',
},
{
    field: 'complemento',
    label: 'Complemento',
    maxLength: 20,
},
{    
    field: 'rua',
    label: 'Rua',
    maxLength: 100,        
},
{    
    field: 'bairro',
    label: 'Bairro',
    maxLength: 40,
},
{
    field: 'cidade',
    label: 'Cidade',
    maxLength: 60,        
},
{
    field: 'uf',
    label: 'Estado',
    maxLength: 2
}
]