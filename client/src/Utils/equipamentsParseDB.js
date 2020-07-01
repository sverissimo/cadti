export const accessParseDB = (veiculos, access) => {

    let acArray = [], acessibilidade = [], ids = []

    veiculos.forEach(v => {
        if (v.equipamentosId) {
            acArray = v.equipamentosId.split(',')
            acArray.forEach(ac => {
                access.forEach(({ id, item }) => {
                    if (ac.replace(/\s+/gi, '') === item.replace(/\s+/gi, '')) ids.push(id)
                })
            })
        }
        acessibilidade.push({ id: v.veiculoId, ids: JSON.stringify(ids).replace('[', '{').replace(']', '}') })
        acArray = []
        ids = []
    })
    return acessibilidade.reverse()
}

export const equipamentsParseDB = (veiculos, equipamentos) => {

    let eqId = [], eqArray = [], eqIdArray = [], other = [], equips = []

    veiculos.forEach(v => {
        if (v.equipamentosId) {
            eqArray = v.equipamentosId.split(',')

            eqArray.forEach(eq => {
                equipamentos.forEach(({ id, item }) => {
                    let
                        newItem = item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                        oldItem = eq.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    if (newItem === 'televisao') newItem = 'tv'
                    if (newItem === 'mesa de jogos') newItem = 'mesa jogos'
                    if (newItem === 'carregador de celular') newItem = 'carregador para celular'
                    if (oldItem === newItem && !eqIdArray.includes(id)) eqIdArray.push(id)
                    if (!equipamentos.includes(eq.trim()) && !other.includes(eq.trim())) other.push(eq.trim())

                })
            })
        }
        eqId.push({ id: v.veiculoId, eqArray, ids: JSON.stringify(eqIdArray) })
        eqArray = []
        eqIdArray = []
    })
    return { eqId: eqId.reverse(), equips, other: other.sort() }
}