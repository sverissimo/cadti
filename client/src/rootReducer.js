import getDataReducer from './Redux/getDataReducer'
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    data: getDataReducer
}) 

export default rootReducer