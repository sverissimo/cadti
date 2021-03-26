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
        lookup: { admin: 'Administrador', tecnico: 'Técnico Seinfra', empresa: 'Delegatário' },
        editable: 'always'
    },
]

export default userTable