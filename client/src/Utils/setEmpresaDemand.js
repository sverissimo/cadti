export const setEmpresaDemand = (demand, redux, socios) => {

    const { pathname } = document.location
    let associateKeys = { name: 'nomeSocio', id: 'socioId' }

    if (pathname.match('procurador'))
        associateKeys = { name: 'nomeProcurador', id: 'procuradorId' }

    const
        { empresas, empresaDocs } = redux,
        { name, id } = associateKeys,
        history = demand?.history || [],
        length = history?.length,

        selectedEmpresa = empresas.find(e => e.codigoEmpresa === demand?.empresaId),
        razaoSocial = selectedEmpresa?.razaoSocial

    let
        lastUpdate,
        newMembers = [],
        oldMembers = [],
        latestDoc

    if (history[0]) lastUpdate = history[length - 1]

    if (lastUpdate) {
        newMembers = lastUpdate?.newMembers || []
        oldMembers = lastUpdate?.oldMembers || []
    }

    //******************Get latest uploaded files per field

    const
        latestDocId = history
            .reverse()
            .find(el => el.files)?.files || []

    if (latestDocId[0])
        latestDoc = empresaDocs.find(doc => doc.id === latestDocId[0])

    if (oldMembers[0])
        socios.forEach(s => {
            oldMembers.forEach(om => {
                if (s[id] === om[id])
                    Object.keys(om).forEach(key => {
                        s[key] = om[key]
                    })
            })
        })

    const
        filteredSocios = socios
            .concat(newMembers)
            .sort((a, b) => a[name].localeCompare(b[name]))

    //****************** Return the object
    return {
        razaoSocial, selectedEmpresa, demand, latestDoc, newMembers, oldMembers, getUpdatedValues, filteredSocios
    }
}

function getUpdatedValues(originalObj, newObj) {
    Object.keys(newObj).forEach(key => {
        if (newObj[key] && originalObj[key]) {

            if (key === 'equipamentosId' || key === 'acessibilidadeId')
                newObj[key].sort((a, b) => a - b)

            if (newObj[key].toString() === originalObj[key].toString())
                delete newObj[key]
        }
        if (newObj[key] === '' || newObj[key] === 'null' || !newObj[key]) delete newObj[key]
    })
    const updatedFields = newObj
    return updatedFields
}