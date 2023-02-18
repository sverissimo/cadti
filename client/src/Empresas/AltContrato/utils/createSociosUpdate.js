//@ts-check
export const createSociosUpdate = (state) => {
    const { filteredSocios, demand } = state
    const socios = filteredSocios.filter(s => !!s.status)
    if (!socios.length) {
        return null
    }

    const socioUpdates = socios.map(s => {
        const { edit, createdAt, razaoSocial, ...socio } = s
        return socio
    })

    if (!demand) {
        return socioUpdates
    }

    const update = socioUpdates.map(s => {
        const { originalStatus, ...socio } = s
        return socio
    })

    return update
}
