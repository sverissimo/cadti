//Essa função foi criada para transformar os strings "equipamentos" do DB antigo para ids, com todas as diferenças de digitação/Upper/Lower.
//Não possui nenhuma funcionalidade no aplicativo rodando, mas fica aqui para caso haja necessidade de refazer essa conversão em outro ambiente.

const accessParseDB = (veiculos, access) => {

    let acArray = [], acessibilidade = [], ids = []

    veiculos.forEach(v => {
        if (v.equipamentos) {
            acArray = v.equipamentos.split('; ')
            acArray.forEach(ac => {
                access.forEach(({ id, item }) => {
                    if (ac.replace(/\s+/gi, '') === item.replace(/\s+/gi, ''))
                        ids.push(id)
                })
            })
        }
        acessibilidade.push({ v_id: v.veiculo_id, ids: JSON.stringify(ids) })
        acArray = []
        ids = []
    })
    return acessibilidade.reverse()
}

const equipamentsParseDB = (veiculos, equipamentos) => {

    let eqId = [], eqArray = [], eqIdArray = [], other = [], allEqs = []
    //console.log(typeof veiculos)
    veiculos.forEach(v => {
        if (v.equipamentos) {
            eqArray = v.equipamentos.split('; ')

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
                    allEqs.push(oldItem, newItem)
                })
            })
        }
        eqId.push({ v_id: v.veiculo_id, eqArray, ids: JSON.stringify(eqIdArray) })
        eqArray = []
        eqIdArray = []
    })

    const uniqueEqs = [...new Set(allEqs)]
    let uniqueExistent = []

    eqId.forEach(({ eqArray }) => {
        eqArray.forEach(eq => {
            uniqueExistent.push(eq)
        })
    })
    uniqueExistent = [...new Set(uniqueExistent)]
    console.log(uniqueExistent)
    //return { eqId: eqId.reverse(), other: other.sort() }
    return eqId
}

module.exports = { accessParseDB, equipamentsParseDB }