import React, { useState, useEffect } from "react";
import axios from "axios";
import UserAuthTemplate from "./UserAuthTemplate";
import ReactToast from '../Reusable Components/ReactToast'
import userAuthForms from "./userAuthForms";
import { logUser } from "../Store/userActions";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setCookie } from "../Utils/documentCookies";
import valueParser from "../Utils/valueParser";

const UserAuth = props => {
  const [state, setState] = useState({ tab: 0, ...userAuthForms[0] })
  const { tab, toastMsg, toastStatus, confirmToast } = state
  const webBrowser = window.navigator.userAgent

  useEffect(() => {
    //Detecta o Browser do usuário e muda estado para renderizar sugestão caso não seja compatível
    if (!webBrowser.match('Chrome'))
      setState({ ...state, browserNotCompatible: true })
    //eslint-disable-next-line
  }, [])

  const changeTab = tab => setState({ ...state, tab, ...userAuthForms[tab] })

  const handleInput = e => {
    const { name, value } = e.target
    const parsedValue = valueParser(name, value)

    setState({ ...state, [name]: parsedValue })
  }

  const login = async () => {
    try {
      //caso as credenciais (usuário/senha) estejam certas, um token foi armazenado. Faz-se então uma requisição GET dos dados do usuário
      await axios.post('/auth/login', state)
      const { data: loggedUser } = await axios.get('/api/users/getUser')
      //Ao se descodificar o token, se as credenciais estiverem certas e o token válido, retorna o usuário, armazena na globalStore e cria cookie local.
      setCookie('loggedIn', true)
      props.logUser(loggedUser)
    }
    catch (err) {
      toast(err?.response?.data, 'error')
    }
  }

  const signUp = async () => {
    const user = state.form.reduce((prev, curr) => ({ ...prev, [curr.name]: state[curr.name] }), {})
    try {
      await axios.post('/auth/signUp', user)
      toast('Usuário cadastrado.')
      setTimeout(() => setState(prevState => ({ ...prevState, tab: 0, ...userAuthForms[0] })), 1250)
    } catch (error) {
      toast(error?.response?.data, 'error')
    }
  }

  const retrievePassword = async () => {
    const { email } = state
    try {
      const { data: message } = await axios.post('/auth/retrievePassword', { email })
      toast(message)
      setTimeout(() => setState({ tab: 0, ...userAuthForms[0] }), 1750)
    } catch (error) {
      toast(error?.response?.data, 'error')
    }
  }

  const handleSubmit = () => {
    if (tab === 0)
      login()
    if (tab === 1)
      signUp()
    if (tab === 2)
      retrievePassword()
  }
  //Tecla de atalho "Enter" para entrar
  useEffect(() => {
    const signIn = e => {
      if (e.key === 'Enter')
        handleSubmit()
    }
    document.addEventListener('keypress', signIn)
    return () => document.removeEventListener('keypress', signIn)
  })

  const toast = (toastMsg, toastStatus) => setState(prevState => ({ ...prevState, confirmToast: !state.confirmToast, toastMsg, toastStatus }))

  return (
    <>
      <UserAuthTemplate
        data={state}
        handleInput={handleInput}
        handleSubmit={handleSubmit}
        changeTab={changeTab}
      />
      <ReactToast open={confirmToast} close={toast} msg={toastMsg} status={toastStatus} />
    </>
  )
}

function mapStateToProps(state) {
  return {
    redux: {
      ...state.user
    }
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logUser }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAuth)
