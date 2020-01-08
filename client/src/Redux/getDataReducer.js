const initState = {
    veiculos: [],
    modelosChassi: [],
    carrocerias: [],    
    empresas: [],
    seguradoras: [],
    seguros: [],
    equipamentos: [],    
    search: '',
    setColor: '',
    loading: false
}

const getDataReducer = (state = initState, action) => {
    const { payload } = action
    switch (action.type) {
        case 'VEHICLE_FULL_DATA':
            return { ...state, ...payload }

        case 'VEICULOS_INIT':
            return { ...state, ...payload }


        case 'LOAD_EMP_DATA':
            return { ...state, empCollection: action.payload }

        case 'LOAD_RT_DATA':
            return { ...state, rtCollection: action.payload }

        case 'LOAD_PROCESS_DATA':
            return { ...state, processCollection: action.payload }

        case 'LOAD_FILES_DATA':
            return { ...state, filesCollection: action.payload }

        case 'LOAD_TECNICOS':
            return { ...state, tecCollection: action.payload }

        case 'SET_COLOR':
            return { ...state, setColor: action.payload }

        case 'LOADING':
            return { ...state, loading: action.payload }

        default:
            return state
    }
}

export default getDataReducer;