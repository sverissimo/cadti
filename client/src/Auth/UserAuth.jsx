import React, { useState } from "react";
import axios from "axios";
import SignupTemplate from "./SignUpTemplate";

const UserAuth = () => {

  const [state, setState] = useState({})

  const handleInput = e => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }

  const handleSubmit = () => {
    console.log(state)
    axios.post('/auth/signUp', state)
      .then(r => console.log(r))
      .catch(err => console.log(err))
  }

  return (
    <>
      <SignupTemplate
        data={state}
        handleInput={handleInput}
        handleSubmit={handleSubmit}
      />

    </>
  )
}

export default UserAuth
