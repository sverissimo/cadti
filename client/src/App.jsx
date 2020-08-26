import React from 'react';
import { BrowserRouter } from 'react-router-dom'

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import promise from 'redux-promise';
import multi from 'redux-multi';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer'

import { Header, Footer } from './Layouts'
import Container from '@material-ui/core/Container';
import Routes from './Routes'
import './Layouts/stylez.css'

function App() {

  const store = applyMiddleware(promise, multi, thunk)(createStore)

  return (
    <Provider store={store(rootReducer)}>
      <div className='app'>
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
