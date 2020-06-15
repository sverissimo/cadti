import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom'

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import promise from 'redux-promise';
import multi from 'redux-multi';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer'

import { ReactContext } from './Store/ReactContext'

import { Header, Footer } from './Layouts'
import { Container } from '@material-ui/core';
import Routes from './Routes'

function App() {

  const
    store = applyMiddleware(promise, multi, thunk)(createStore),
    [context, setContext] = useState()

  return (
    <Provider store={store(rootReducer)}>
      <div style={{ backgroundColor: '#fbfbfb' }}>
        <Container maxWidth="lg" style={{ minHeight: '100vh' }}>
          <BrowserRouter>
            <ReactContext.Provider value={{ context, setContext }}>
              <Header />
              <Routes />
            </ReactContext.Provider>
          </BrowserRouter>
          <Footer />
        </Container>
      </div>
    </Provider>
  )
}

export default App;
