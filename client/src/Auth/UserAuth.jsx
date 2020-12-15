import React, { useState } from "react";
import axios from "axios";
import SignupTemplate from "./SignUpTemplate";
import ReactToast from '../Reusable Components/ReactToast'
import userAuthForms from "./userAuthForms";

const UserAuth = () => {

  const [state, setState] = useState({ tab: 0, ...userAuthForms[0] })

  const handleInput = e => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }

  const handleSubmit = () => {

    const { endPoint, toastMsg } = state

    axios.post(endPoint, state)
      .then(r => {
        if (r.status === 200) {
          if (toastMsg)
            toast(toastMsg)
          setTimeout(() => { setState({...state, ...userAuthForms[0]}) }, 1200)
        }
      })
      .catch(err => setState({ ...state, errorMessage: err?.response?.data }))
  }

  const
    toast = toastMsg => setState({ ...state, confirmToast: !state.confirmToast, toastMsg }),
    { confirmToast, toastMsg } = state

  return (
    <>
      <SignupTemplate
        data={state}
        handleInput={handleInput}
        handleSubmit={handleSubmit}
      />
      <ReactToast open={confirmToast} close={toast} msg={toastMsg} />    </>
  )
}

export default UserAuth
