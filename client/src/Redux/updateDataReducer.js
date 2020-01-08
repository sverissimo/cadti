const initState = {}

const updateDataReducer = (state = initState, action) => {
    const { payload } = action
    switch (action.type) {
        case 'UPDATE_VEHICLE':
            return { ...state, ...payload }            

        case 'VEICULOS_INIT':
            return { ...state, ...payload }
            
        default:
            return state
    }
}

export default updateDataReducer;