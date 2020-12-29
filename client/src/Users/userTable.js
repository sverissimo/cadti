const userTable = [
    {
        field: 'name',
        title: 'Nome',
    },
    {
        field: 'cpf',
        title: 'CPF',
    },
    {
        field: 'email',
        title: 'E-mail',
    },
    {
        field: 'role',
        name: 'role',
        title: 'Perfil',
        lookup: { admin: 'admin', empresa: 'empresa' },
        editable: 'always'
    },
]

export default userTable