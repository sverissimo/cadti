import React from 'react';

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import promise from 'redux-promise';
import multi from 'redux-multi';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer'
import Authentication from './Authentication';

import './Layouts/stylez.scss'

function App() {
  const store = applyMiddleware(promise, multi, thunk)(createStore)
  return (
    <Provider store={store(rootReducer, /* preloadedState, */
      window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())}>
      <Authentication />
    </Provider>
  )
}

export default App;
