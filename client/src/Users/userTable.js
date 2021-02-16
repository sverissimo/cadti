const userTable = [
    {
        field: 'name',
        title: 'Nome',
        label: 'Nome',
    },
    {
        field: 'cpf',
        title: 'CPF',
        label: 'CPF',
    },
    {
        field: 'email',
        title: 'E-mail',
        label: 'E-mail',
    },
    {
        field: 'role',
        name: 'role',
        title: 'Perfil',
        label: 'Perfil',
        lookup: { admin: 'admin', empresa: 'empresa' },
        editable: 'always'
    },
]

export default userTable