import { cpf } from "../Forms/commonFields"

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
    { ...cpf, name: 'cpf', field: 'cpf' },
    ...loginForm,
    {
        name: 'confirmPassword',
        label: 'Confirme sua senha',
        type: 'password'
    },
    /*  {
         name: 'role',
         label: 'Perfil de usuário',
         options: [
             {
                 optionLabel: 'Administrador',
                 optionValue: 'admin'
             },
             {
                 optionLabel: 'Delegatário',
                 optionValue: 'empresa'
             },
             {
                 optionLabel: 'Técnico Seinfra',
                 optionValue: 'seinfra'
             },
         ]
     } */
]

const forgotPassForm = [
    {
        name: 'email',
        label: 'E-mail'
    },
]

const userAuthForms = [
    { title: 'Fazer login', form: loginForm, buttonLabel: 'entrar', endPoint: '/auth/login' },
    { title: 'Cadastro de Usuário', form: signUpForm, buttonLabel: 'Cadastrar', endPoint: '/auth/signUp', toastMsg: 'Usuário cadastrado.' },
    { title: 'Recuperação de senha', form: forgotPassForm, buttonLabel: 'Recuperar senha', endPoint: '/auth/forgotPassword', toastMsg: 'Senha enviada para o e-mail registrado.' }
]

export default userAuthForms