//@ts-check
export const createSociosUpdate = (filteredSocios, demand) => {
    const socios = filteredSocios.filter(s => !!s.status)
    if (!socios.length) {
        return
    }

    const socioUpdates = socios.map(s => {
        const { edit, createdAt, razaoSocial, ...socio } = s
        Object.keys(socio).forEach(k => { if (!socio[k]) delete socio[k] })
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
