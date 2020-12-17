import dataReducer from './Store/dataReducer'
import { combineReducers } from 'redux';
import userReducer from './Store/userReducer';

const appReducer = combineReducers({
    data: dataReducer,
    user: userReducer
})

const rootReducer = (state, action) => {
    if (action.type === 'LOG_USER_OUT') 
        state = { data: {}, user: {} }
    
    return appReducer(state, action)
}

export default rootReducer