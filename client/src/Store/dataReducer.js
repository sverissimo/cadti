const dataReducer = (state = {}, action) => {
    const { type, payload } = action

    switch (type) {

        case 'GET_DATA':
            return { ...state, ...payload }

        case 'INSERT_DATA': {
            const { collection, data } = payload

            if (state[collection] && data) {
                let update = [...state[collection]]

                data.forEach(el => {
                    if (collection.match('logs'))
                        update.push(el)
                    else
                        update.unshift(el)
                })

                return {
                    ...state, [collection]: update
                }
            }
            return state
        }

        case 'UPDATE_DATA': {
            const { collection, data, id } = payload
            console.log("🚀 ~ file: dataReducer.js:31 ~ dataReducer ~ payload", payload)

            if (state[collection] && data) {
                const update = state[collection].map(v => {
                    data.forEach(el => {
                        if (v[id] === el[id] || v[id].toString() === el[id].toString()) {
                            v = el
                        }
                    })
                    return v
                })

                return {
                    ...state, [collection]: update
                }
            }
            return state
        }

        case 'REMOVE_FROM_INSURANCE':
            const { apolice, placaIndex, vehicleIndex } = payload

            if (state.seguros) {

                let seguros = [...state.seguros],
                    seguro = seguros.find(s => s.apolice === apolice),
                    index = seguros.findIndex(s => s.apolice === apolice)

                seguro.placas.splice(placaIndex, 1)
                seguro.veiculos.splice(vehicleIndex, 1)
                seguros[index] = seguro
                // console.log(seguros)
                return {
                    ...state, seguros
                }
            }
            return state

        case 'DELETE_ONE':
            const { tablePK, collection } = payload

            if (state[collection]) {
                let
                    { id } = payload,
                    updatedData = [...state[collection]]

                if (!id)
                    return

                if (!collection.match('Docs') && collection !== 'users' && collection !== 'avisos')
                    id = Number(id)
                if (collection === 'laudos')
                    id = id.toString()

                console.log("🚀 ~ file: dataReducer.js ~ line 83 ~ dataReducer ~ updatedData", { id, updatedData })
                const
                    element = updatedData.find(el => el[tablePK] === id),
                    index = updatedData.findIndex(el => el[tablePK] === element[tablePK])

                if (index === -1)
                    return

                updatedData.splice(index, 1)

                return {
                    ...state, [collection]: updatedData
                }
            }
            return state

        case 'SET_COLOR':
            return { ...state, setColor: action.payload }

        case 'LOADING':
            return { ...state, loading: action.payload }

        default:
            return state
    }
}

export default dataReducer;