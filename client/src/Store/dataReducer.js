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
            const veiculosArray = state.veiculos.map(v => {
                payload.forEach(el => {
                    if (v.veiculoId === el.veiculoId) {
                        v = el
                    }
                })
                return v
            })

            return {
                ...state, veiculos: veiculosArray
            }

        case 'UPDATE_COLLECTION':
            const { data, col } = payload

            return {
                ...state, [col]: data
            }

        case 'REMOVE_FROM_INSURANCE':
            const { apolice, placaIndex, vehicleIndex } = payload

            let seguros = [...state.seguros],
                seguro = seguros.find(s => s.apolice === apolice),
                index = seguros.findIndex(s => s.apolice === apolice)

            seguro.placas.splice(placaIndex, 1)
            seguro.veiculos.splice(vehicleIndex, 1)
            seguros[index] = seguro
            console.log(seguros)
            return {
                ...state, seguros
            }

        /* case 'DELETE_ONE':
            const { collection, index } = payload
            let updatedData = state[collection].splice(index, 1)
            return {
                ...state, [collection]: updatedData
            } */

        case 'SET_COLOR':
            return { ...state, setColor: action.payload }

        case 'LOADING':
            return { ...state, loading: action.payload }

        default:
            return state
    }
}

export default dataReducer;