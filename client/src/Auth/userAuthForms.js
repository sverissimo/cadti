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
    }
]

const forgotPassForm = [
    {
        name: 'email',
        label: 'E-mail'
    },
]

const userAuthForms = [
    { title: 'Fazer login', form: loginForm, buttonLabel: 'entrar' },
    { title: 'Cadastro de Usuário', form: signUpForm, buttonLabel: 'Cadastrar', toastMsg: 'Usuário cadastrado.' },
    { title: 'Recuperação de senha', form: forgotPassForm, buttonLabel: 'Recuperar senha', toastMsg: 'Senha enviada para o e-mail registrado.' }
]

export default userAuthForms