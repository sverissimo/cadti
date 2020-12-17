import React, { useEffect, useState } from "react";
import axios from "axios";
import SignupTemplate from "./SignUpTemplate";
import ReactToast from '../Reusable Components/ReactToast'
import userAuthForms from "./userAuthForms";
import { logUser } from "../Store/userActions";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setCookie } from "../Utils/documentCookies";

const UserAuth = (props) => {

  const
    [state, setState] = useState({ tab: 0, ...userAuthForms[0] }),
    { endPoint, toastMsg, tab } = state

  const handleInput = e => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }

  const login = () => {
    let getUser, userFound

    axios.post(endPoint, state)
      .then(async r => {
        if (r.status === 200) {
          getUser = await axios.get('/getUser')
          userFound = getUser?.data

          if (userFound) {
            setCookie('loggedIn', true)
            props.logUser(userFound)
          }
        }
      })
      .catch(err => setState({ ...state, errorMessage: err?.response?.data }))
  }

  const handleSubmit = () => {
    if (tab === 0)
      login()

    if (toastMsg)
      toast(toastMsg)
    setTimeout(() => { setState({ ...state, ...userAuthForms[0] }) }, 1200)
  }

  const
    toast = toastMsg => setState({ ...state, confirmToast: !state.confirmToast, toastMsg }),
    { confirmToast } = state

  useEffect(() => {
    return () => setState()
  }, [])

  return (
    <>
      <SignupTemplate
        data={state}
        handleInput={handleInput}
        handleSubmit={handleSubmit}
      />
      <ReactToast open={confirmToast} close={toast} msg={toastMsg} />
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