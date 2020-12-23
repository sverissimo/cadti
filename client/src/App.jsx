import React from 'react';

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import promise from 'redux-promise';
import multi from 'redux-multi';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer'
import Authentication from './Authentication';

import './Layouts/stylez.scss'

export const store = applyMiddleware(promise, multi, thunk)(createStore)(rootReducer, /* preloadedState, */
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

function App() {
  return (
    <Provider store={store}>
      <Authentication />
    </Provider>
  )
}

export default App;
