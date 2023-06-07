//@ts-check
export const initialState = {
    selectedVehicles: [],
    segurosVencidos: [],
    segurosVigentes: 0,
    veiculosAntigos: 0,
    veiculosNovos: 0,
}

export function relatoriosReducer(state, action) {
    const { type, payload } = action;
    switch (type) {
        case 'SET_VEICULOS':
            return {
                ...state,
                selectedVehicles: payload.selectedVehicles,
                veiculosAntigos: payload.veiculosAntigos,
                veiculosNovos: payload.veiculosNovos,
            }
        case 'SET_SEGUROS':
            return {
                ...state,
                segurosVencidos: payload.segurosVencidos,
                segurosVigentes: payload.segurosVigentes,
            }
        case 'RESET':
            return initialState
        default:
            throw new Error()
    }
}
