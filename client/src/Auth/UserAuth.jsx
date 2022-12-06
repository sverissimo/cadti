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
import confirmEmailMsg from "./confirmEmailMsg";

const UserAuth = props => {

  const
    [state, setState] = useState({ tab: 0, ...userAuthForms[0] })
    , { tab, endPoint, toastMsg, toastStatus, confirmToast } = state
    , webBrowser = window.navigator.userAgent


  useEffect(() => {
    //Detecta o Browser do usuário e muda estado para renderizar sugestão caso não seja compatível
    if (!webBrowser.match('Chrome'))
      setState({ ...state, browserNotCompatible: true })
    //eslint-disable-next-line
  }, [])


  const changeTab = tab => setState({ ...state, tab, ...userAuthForms[tab] })

  const handleInput = e => {
    const
      { name, value } = e.target,
      parsedValue = valueParser(name, value)

    setState({ ...state, [name]: parsedValue })
  }

  const login = async () => {
    //Efetua o login com as informações preenchidas pelo usuário
    try {
      await axios.post(endPoint, state)
      //caso as credenciais (usuário/senha) estejam certas, um token foi armazenado. Faz-se então uma requisição GET dos dados do usuário
      const
        getUser = await axios.get('/api/users/getUser'),
        userFound = getUser?.data
      console.log("🚀 ~ file: UserAuth.jsx:47 ~ login ~ userFound", userFound)
      //Ao se descodificar o token, se as credenciais estiverem certas e o token válido, retorna o usuário, armazena na globalStore e cria cookie local.      

      setCookie('loggedIn', true)
      props.logUser(userFound)
    }
    catch (err) {
      toast(err?.response?.data, 'error')
    }
  }

  const signUp = async () => {
    const { form, endPoint, confirmToast, toastMsg, ...request } = state
    let
      error,
      tab = 1
    if (request instanceof Object)
      request.role = 'empresa'
    const
      { email, name } = request,
      mail = {
        to: email,
        subject: 'Confirmação de e-mail',
        vocativo: name
      }

    await axios.post(endPoint, request)
      .then(r => {
        const
          userId = r?.data?.id,
          message = confirmEmailMsg(email, userId)

        mail.message = message
        axios.post(`/alerts/mail`, mail)
      })
      .catch(err => {
        toast(err?.response?.data, 'error')
        error = true
      })

    if (!error) {
      tab = 0
      toast('Usuário cadastrado.')
      setTimeout(() => setState({ tab, ...userAuthForms[tab] }), 1250)
    }

  }

  const retrievePassword = async () => {
    const
      { email } = state
      , recoveryMail = email

    axios.post(endPoint, { recoveryMail })
      .then(r => {
        toast(r.data)
        setTimeout(() => setState({ tab: 0, ...userAuthForms[0] }), 1250)
      })
      .catch(err => {
        toast(err?.response?.data, 'error')
      })
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

  const toast = (toastMsg, toastStatus) => setState({ ...state, confirmToast: !state.confirmToast, toastMsg, toastStatus })


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