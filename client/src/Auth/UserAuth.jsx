import React, { useState } from "react";
import axios from "axios";
import UserAuthTemplate from "./UserAuthTemplate";
import ReactToast from '../Reusable Components/ReactToast'
import userAuthForms from "./userAuthForms";
import { logUser } from "../Store/userActions";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setCookie } from "../Utils/documentCookies";
import valueParser from "../Utils/valueParser";

const UserAuth = (props) => {

  const
    [state, setState] = useState({ tab: 0, ...userAuthForms[0] }),
    { endPoint, toastMsg, tab } = state

  const handleInput = e => {
    const { name, value } = e.target
    const parsedValue = valueParser(name, value)

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
      setCookie('loggedIn', true)
      props.logUser(userFound)
    }
    catch (err) {
      toast(err?.response?.data)
    }
  }

  const signUp = async () => {
    await axios.post(endPoint, state)
      .then(r => console.log(r))
      .catch(err => console.log(err))
    setState({ tab: 0, ...userAuthForms[0] })
  }

  const handleSubmit = () => {
    if (tab === 0)
      login()

    if (tab === 1)
      signUp()

    if (toastMsg)
      toast(toastMsg)
  }

  const
    toast = toastMsg => setState({ ...state, confirmToast: !state.confirmToast, toastMsg }),
    { confirmToast } = state

  return (
    <>
      <UserAuthTemplate
        data={state}
        handleInput={handleInput}
        handleSubmit={handleSubmit}
      />
      <ReactToast open={confirmToast} close={toast} msg={toastMsg} status={tab === 0 ? 'error' : 'success'} />
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