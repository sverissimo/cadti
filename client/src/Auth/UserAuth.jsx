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
const socketIO = require('socket.io-client')

const UserAuth = props => {

  const
    [state, setState] = useState({ tab: 0, ...userAuthForms[0] }),
    { tab, endPoint, toastMsg, toastStatus, confirmToast } = state

  useEffect(() => {
    const signIn = e => {
      if (e.key === 'Enter')
        handleSubmit()
    }
    document.addEventListener('keypress', signIn)
    return () => document.removeEventListener('keypress', signIn)
  })


  const changeTab = tab => setState({ ...state, tab, ...userAuthForms[tab] })

  const handleInput = e => {
    const
      { name, value } = e.target,
      parsedValue = valueParser(name, value)

    setState({ ...state, [name]: parsedValue })
  }

  const login = async () => {
    //Efetua o login com as informações preencidas pelo usuário
    try {
      await axios.post(endPoint, state)
      //caso as credenciais (usuário/senha) estejam certas, um token foi armazenado. Faz-se então uma requisição GET dos dados do usuário
      const
        getUser = await axios.get('/getUser'),
        userFound = getUser?.data
      //Ao se descodificar o token, se as credenciais estiverem certas e o token válido, retorna o usuárui, armazena na globalStore e cria cookie local.      

      const socket = socketIO()
      socket.on('userSocket', socketId => {
        userFound.socketId = socketId
        props.logUser(userFound)
      })
      setCookie('loggedIn', true)
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

    await axios.post(endPoint, request)
      .then(r => console.log(r))
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

  const handleSubmit = () => {
    if (tab === 0)
      login()

    if (tab === 1)
      signUp()
  }

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