import dataReducer from './Store/dataReducer'
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    
    data: dataReducer,
    vehicleData: dataReducer

})

export default rootReducer