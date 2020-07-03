export const idsToString = (veiculos, equipamentos, acessibilidade) => {

    let equipNames = [], accessNames = []

    const equips = veiculos.map(v => {
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
        const result = { ...v, equipamentos: equipNames, acessibildade: accessNames }
        equipNames = []
        accessNames = []
        return result
    })
    return equips
}