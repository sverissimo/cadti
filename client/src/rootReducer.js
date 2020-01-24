import dataReducer from './Store/dataReducer'
import { combineReducers } from 'redux';

const rootReducer = combineReducers({    
    data: dataReducer    
})

export default rootReducer