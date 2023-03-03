//@ts-check
export const createSociosUpdate = (filteredSocios, demand) => {
    const socios = filteredSocios.filter(s => !!s.status)
    if (!socios.length) {
        return
    }

    const socioUpdates = socios.map(s => {
        const { edit, createdAt, razaoSocial, nomeEmpresas, ...socio } = s
        Object.keys(socio).forEach(k => { if (!socio[k]) delete socio[k] })
        return socio
    })

    if (!demand) {
        return socioUpdates
    }

    socioUpdates.forEach(s => delete s.originalStatus)

    const newSocios = socioUpdates
        .filter(s => s.status === 'new')
        .map(s => ({ ...s, status: undefined }))

    const modifiedSocios = socioUpdates
        .filter(s => s.status !== 'new')

    return { newSocios, modifiedSocios }
}
