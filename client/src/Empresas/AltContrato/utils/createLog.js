//@ts-check
export const createLog = ({ state, demand, altEmpresa, altContrato, approved, socioUpdates }) => {
    const { selectedEmpresa, info } = state
    const { codigoEmpresa } = selectedEmpresa
    const declined = !!!approved

    if (!demand) {
        return {
            history: {
                altContrato,
                info,
                altEmpresa,
                socioUpdates
            },
            empresaId: codigoEmpresa,
            historyLength: 0,
            approved,
        }
    }

    const { id, empresaId } = demand
    if (declined) {
        return {
            id,
            empresaId,
            declined,
            history: {
                info
            },
        }
    }

    const { demandFiles } = state
    return {
        id,
        demandFiles,
        approved,
        history: {},
    }
}
