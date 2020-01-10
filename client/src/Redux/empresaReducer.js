const initState = {  
    empresas: [],
    seguradoras: [],
    seguros: []    
}

const empresaReducer = (state = initState, action) => {
    const { payload } = action
    switch (action.type) {

        case 'GET_DATA':
            return { ...state, ...payload }
        default:
            return state
    }
}

export default empresaReducer;