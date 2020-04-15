import React, { useState } from 'react'
import StoreHOC from '../Store/StoreHOC'
import RelatoriosTemplate from './RelatoriosTemplate'

const Relatorios = props => {

    const
        { veiculos, empresas } = props.redux,
        [razaoSocial, setRazaoSocial] = useState(''),
        [selectedEmpresa, setEmpresa] = useState(undefined)      

    const handleInput = e => {
        const { value } = e.target
        setRazaoSocial(value)
        const empresa = empresas.find(e => e.razaoSocial === value)
        if (empresa) setEmpresa(empresa)
        else setEmpresa('')
    }

    let selectedId, selectedVehicles
    if (selectedEmpresa && selectedEmpresa !== '') {
        selectedId = selectedEmpresa.delegatarioId
        selectedVehicles = veiculos
            .filter(v => v.delegatarioId === selectedId)
    } else selectedVehicles = veiculos


    // **************************MÉDIA****************************

    const idades =
        selectedVehicles
            .map(({ anoCarroceria }) => anoCarroceria)
            .filter(ano => ano !== null)
            .sort()

    let mediaIdades = idades.reduce((a, b) => a + b / idades.length, 0)
    mediaIdades = new Date().getFullYear() - mediaIdades.toPrecision(4)

    // **************************MODA****************************

    let counter = {}
    idades.forEach(function (e) {
        if (counter[e] === undefined) {
            counter[e] = 0
        }
        counter[e] += 1
    })

    const
        unsortedLabels = Object.keys(counter),
        labels = [...unsortedLabels.sort((a, b) => a - b)],
        values = Object.values(counter)        

    let moda = unsortedLabels.sort((a, b) => counter[a] - counter[b])
    moda = moda[moda.length - 1]

    return (
        <RelatoriosTemplate
            empresas={empresas}
            razaoSocial={razaoSocial}
            labels={labels}
            values={values}
            selectedEmpresa={selectedEmpresa}
            selectedVehicles={selectedVehicles}
            mediaIdades={mediaIdades}
            moda={moda}
            handleInput={handleInput}
        />
    )
}

const collections = ['veiculos', 'empresas']

export default StoreHOC(collections, Relatorios)