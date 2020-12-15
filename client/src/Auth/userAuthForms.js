const loginForm = [
    {
        name: 'email',
        label: 'E-mail'
    },
    {
        name: 'password',
        label: 'Senha',
        type: 'password'
    },
]

const signUpForm = [
    {
        name: 'name',
        label: 'Nome Completo'
    },
    ...loginForm,
    {
        name: 'confirmPassword',
        label: 'Confirme sua senha'
    },
    {
        name: 'role',
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

const userAuthForms = [
    { title: 'Fazer login', form: loginForm, buttonLabel: 'entrar', endPoint: '/auth/login' },
    { title: 'Cadastro de Usuário', form: signUpForm, buttonLabel: 'Cadastrar', endPoint: '/auth/signUp', toastMsg: 'Usuário cadastrado.' },
    { title: 'Recuperação de senha', form: signUpForm, buttonLabel: 'Recuperar senha', endPoint: '/auth/forgotPassword', toastMsg: 'Senha enviada para o e-mail registrado.' }
]

export default userAuthForms