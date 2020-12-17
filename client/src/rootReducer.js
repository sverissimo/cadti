import dataReducer from './Store/dataReducer'
import { combineReducers } from 'redux';
import userReducer from './Store/userReducer';

const rootReducer = combineReducers({
    data: dataReducer,
    user: userReducer
})

export default rootReducer