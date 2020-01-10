import getDataReducer from './Redux/getDataReducer'
import empresaReducer from './Redux/empresaReducer'
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    vehicleData: getDataReducer,
    otherData: empresaReducer
}) 

export default rootReducer