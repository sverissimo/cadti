const initState = {}

const dataReducer = (state = initState, action) => {
    const { type, payload } = action

    switch (type) {

        case 'GET_DATA':
            return { ...state, ...payload }

        case 'INSERT_DATA': {
            const { collection, data } = payload
            let update = state[collection]
            data.forEach(el => update.push(el))
            return {
                ...state, [collection]: update
            }
        }

        case 'UPDATE_DATA': {
            const { collection, data, id } = payload
            const update = state[collection].map(v => {
                data.forEach(el => {
                    if (v[id] === el[id]) {
                        v = el
                    }
                })
                return v
            })
            console.log({ [collection]: update })
            return {
                ...state, [collection]: update
            }
        }


        case 'UPDATE_COLLECTION': {
            const { data, collection } = payload
            return {
                ...state, [collection]: data
            }
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