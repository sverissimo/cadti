const initState = {}

const dataReducer = (state = initState, action) => {
    const { type, payload } = action
    switch (type) {

        case 'GET_DATA':
            return { ...state, ...payload }

        case 'UPDATE_VEHICLE':
            const veiculos = state.veiculos.map(v => v.veiculoId === payload.veiculoId ? payload : v)
            return {
                ...state, veiculos
            }

        case 'UPDATE_INSURANCE':
            console.log(payload)
            const veiculosArray = state.veiculos.map(v => {
                payload.forEach(el => {
                    if (v.veiculoId === el.veiculoId) {
                        v = el
                    }
                })
                return v
            })
            console.log(veiculosArray)
            return {
                ...state, veiculos: veiculosArray
            }

        case 'UPDATE_STATE_DATA':
            const { data, collection } = payload
            return {
                ...state, [collection]: data
            }


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