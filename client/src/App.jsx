import React from 'react';
import { BrowserRouter } from 'react-router-dom'

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import promise from 'redux-promise';
import multi from 'redux-multi';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer'


import { makeStyles } from '@material-ui/core'
import { Header, Footer } from './Layouts'
import { Container } from '@material-ui/core';
import Routes from './Routes'

function App() {

  const useStyles = makeStyles(theme => ({
    root: { backgroundColor:'#fbfbfb' }
  }))

  const { root } = useStyles()
  const store = applyMiddleware(promise, multi, thunk)(createStore)
  return (
    <Provider store={store(rootReducer)}>
      <div className={root}>
        <Container maxWidth="lg" style={{ minHeight: '100vh' }}>
          <BrowserRouter>
            <Header />
            <Routes />
          </BrowserRouter>
          <Footer />
        </Container>
      </div>
    </Provider>
  )
}

export default App;
