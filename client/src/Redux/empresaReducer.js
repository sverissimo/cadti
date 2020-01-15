const initState = {  
  
}

const empresaReducer = (state = initState, action) => {
    const { payload } = action
    switch (action.type) {

        case 'GET_DATAZ':
            return { ...state, ...payload }
        default:
            return state
    }
}

export default empresaReducer;