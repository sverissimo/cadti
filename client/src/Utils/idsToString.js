export const idsToString = (veiculos, equipamentos, acessibilidade) => {

    let equipNames = [], accessNames = []

    const equips = veiculos.map(v => {
        if (!v?.equipa) v.equipa = []
        if (!v?.acessibilidadeId) v.acessibilidadeId = []

        v.equipa.forEach(eqId => {
            equipamentos.forEach(({ id, item }) => {
                if (id === eqId) equipNames.push(item)
            })
        })

        v.acessibilidadeId.forEach(eqId => {
            acessibilidade.forEach(({ id, item }) => {
                if (id === eqId) accessNames.push(item)
            })
        })
        const result = { ...v, equipamentos: equipNames, acessibilidade: accessNames }
        equipNames = []
        accessNames = []
        return result
    })
    return equips
}

export const setNamesFromIds = (collection, ids) => {

    let namesArray = []
    ids.forEach(elementId => {
        collection.forEach(({ id, item }) => {
            if (elementId === id) namesArray.push(item)
        })
    })
    return namesArray
}