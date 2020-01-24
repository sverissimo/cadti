const initState = {}

const dataReducer = (state = initState, action) => {
    const { payload } = action
    switch (action.type) {

        case 'GET_DATA':            
            return { ...state, ...payload }

        case 'UPDATE_VEHICLE':
            return { ...state, veiculos: payload }


        /*  
        
        case 'UPDATE_SOCIO':            
            return { ...state, payload }

        
        case 'UPDATE_FIELDS':
 
             let veiculos = [...state.veiculos]
             const updatedFields = action.payload
 
             let vehicleToUpdate = veiculos.find(v => v.veiculoId === action.payload.id)
             const index = veiculos.indexOf(vehicleToUpdate)
 
             Object.keys(updatedFields).forEach(k => {
                 vehicleToUpdate[k] = updatedFields[k]
             })
             const updatedVehicle = vehicleToUpdate
             console.log(index, updatedVehicle)
             veiculos[index] = updatedVehicle
 
             return { ...state, veiculos } */



        case 'SET_COLOR':
            return { ...state, setColor: action.payload }

        case 'LOADING':
            return { ...state, loading: action.payload }

        default:
            return state
    }
}

export default dataReducer;