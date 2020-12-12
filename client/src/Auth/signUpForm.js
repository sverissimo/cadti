const signUpFields = [
    {
        name: 'name',
        //  className: 'mdi-action-account-circle prefix',
        label: 'Nome Completo'
    },
    {
        name: 'email',
        //className: 'mdi-communication-email prefix',
        label: 'E-mail'
    },
    {
        name: 'password',
        // className: 'mdi-action-lock-outline prefix',
        label: 'Senha'
    },
    {
        name: 'confirmPassword',
        // className: 'mdi-action-lock-outline prefix',
        label: 'Confirme sua senha'
    },
    {
        name: 'role',
        // className: 'mdi-action-account-circle prefix',
        label: 'Perfil de usuário',
        options: [
            {
                optionLabel: 'Delegatário',
                optionValue: 'empresa'
            },
            {
                optionLabel: 'Técnico Seinfra',
                optionValue: 'seinfra'
            },
        ]
    }
]

export default signUpFields