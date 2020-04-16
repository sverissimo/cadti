import React, { useState } from 'react'
import StoreHOC from '../Store/StoreHOC'
import RelatoriosTemplate from './RelatoriosTemplate'

const sum = array => {

    let newArray = [...array]
    newArray.shift()
    const total = newArray.reduce((a, b) => a + b)
    return total
}

const average = array => {
    let newArray = array.map(n => Number(n))
    newArray.shift()

    const
        sum = newArray.reduce((a, b) => a + b),
        average = sum / newArray.length

    return average.toFixed(2)
}

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

    const
        idades =
            selectedVehicles
                .map(({ anoCarroceria }) => anoCarroceria)
                .filter(ano => ano !== null)
                .sort()

    let mediaIdades = idades.reduce((a, b) => a + b / idades.length, 0)
    mediaIdades = (new Date().getFullYear() - mediaIdades).toFixed(2)

    // **************************CONTAGEM****************************

    let counter = {}
    idades.forEach(function (e) {
        if (counter[e] === undefined) {
            counter[e] = 0
        }
        counter[e] += 1
    })

    // *******************CONSOLIDAÇÃO DE VALORES**********************
    const
        unsortedLabels = Object.keys(counter),
        labels = [...unsortedLabels.sort((a, b) => a - b)],
        values = Object.values(counter)

    let obj = {}, arr = [], ultimateObj = {}
    labels.forEach(ano => {
        selectedVehicles.forEach(v => {
            if (v.anoCarroceria && v.anoCarroceria.toString() === ano) {
                arr.push({ veiculoId: v.veiculoId, poltronas: v.poltronas })
                if (!obj[ano]) obj[ano] = arr
                else obj[ano].push(...arr)
                arr = []
            }
        })
        ultimateObj[ano] = obj[ano]
        obj = {}
    })

    let parcial = 0, poltronasPerYear = ['Capacidade Total'], poltronasAcc = [], poltronasMedia = ['Capacidade Média']

    Object.keys(ultimateObj).forEach(year => {
        ultimateObj[year].forEach(v => {
            parcial += v.poltronas
        })
        //poltronasTotal += parcial
        poltronasPerYear.push(parcial)
        poltronasMedia.push((parcial / ultimateObj[year].length).toFixed(2))

        const acc = poltronasPerYear.reduce((a, b) => a + b, 0)
        poltronasAcc.push(acc)
        parcial = 0
    })

    poltronasPerYear.push(sum(poltronasPerYear))

    let
        tableLabels = ['Ano'],
        tableValues = ['Nº de Veículos']

    tableLabels.push(...labels, 'Total')
    tableValues.push(...values)
    tableValues.push(sum(tableValues))
    poltronasMedia.push(average(poltronasMedia))

    const tableData = [tableValues, poltronasMedia, poltronasPerYear]

    // **************************MODA****************************
    let moda = unsortedLabels.sort((a, b) => counter[a] - counter[b])
    moda = moda[moda.length - 1]

    return (
        <RelatoriosTemplate
            empresas={empresas}
            razaoSocial={razaoSocial}
            labels={labels}
            values={values}
            tableLabels={tableLabels}
            tableData={tableData}
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