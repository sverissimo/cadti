import humps from 'humps'

const initState = {}

const getDataReducer = (state = initState, action) => {
    const { payload } = action
    switch (action.type) {

        case 'GET_DATA':

            return { ...state, ...payload }

        case 'UPDATE_SOCIO':
            console.log(payload)
            return { ...state, payload }


        case 'UPDATE_VEHICLE':
            /* 
                        let veiculos = [...state.veiculos]
                        const updatedVehicle = humps.camelizeKeys(payload)
            
                        const oldVehicle = veiculos.find(v => v.veiculoId === updatedVehicle.veiculoId)
                        const index = veiculos.indexOf(oldVehicle)
            
                        console.log(updatedVehicle)
                        veiculos[index] = updatedVehicle */
            console.log(payload)
            return { ...state }


        /*  case 'UPDATE_FIELDS':
 
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


        case 'VEHICLE_DATA':
            return { ...state, ...payload }

        case 'SET_COLOR':
            return { ...state, setColor: action.payload }

        case 'LOADING':
            return { ...state, loading: action.payload }

        default:
            return state
    }
}

export default getDataReducer;