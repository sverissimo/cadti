import React, { useState, useEffect } from 'react'
import StoreHOC from '../Store/StoreHOC'
import RelatoriosTemplate from './RelatoriosTemplate'
import moment from 'moment'

const sum = array => {
    let newArray = [...array]
    newArray.shift()
    if (newArray[0]) {
        const total = newArray.reduce((a, b) => a + b)
        return total
    }
}

const average = array => {
    let newArray = array.map(n => Number(n))
    newArray.shift()

    if (newArray[0]) {
        const
            sum = newArray.reduce((a, b) => a + b),
            average = sum / newArray.length

        return average.toFixed(2)
    }
}

const Relatorios = props => {

    const
        { veiculos, empresas } = props.redux,
        [razaoSocial, setRazaoSocial] = useState(''),
        [selectedEmpresa, setEmpresa] = useState(undefined),
        [allExpired, setExpired] = useState(''),
        [allValid, setValid] = useState(''),
        [oldVehicles, setOldVehicles] = useState('')

    const handleInput = e => {
        const { value } = e.target
        setRazaoSocial(value)
        let empresa

        if (value.length > 2) {
            empresa = empresas.find(e => e.razaoSocial === value)
            if (empresa) setEmpresa(empresa)
        }
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

    //**********************SEGUROS VENCIDOS***********************
    const currentYear = new Date().getFullYear()
    useEffect(() => {
        const
            expired =
                selectedVehicles
                    .filter(r => {
                        if (r.vencimento && moment(r.vencimento).isValid()) {
                            if (moment(r.vencimento).isBefore(moment()) && r.veiculoId) return r
                        }
                        return
                    })
                    .length,

            needsLaudo = selectedVehicles
                .filter(v => currentYear - v.anoCarroceria > 14 && v.anoCarroceria !== null)
                .length

        setExpired(expired)
        setValid(selectedVehicles.length - expired)
        setOldVehicles(needsLaudo)
    }, [])

    let segurosVencidos = [], segurosVigentes, veiculosAntigos, veiculosNovos

    if (razaoSocial.length > 2 && selectedEmpresa) {
        segurosVencidos = selectedVehicles
            .filter(r => {
                if (r.vencimento && moment(r.vencimento).isValid()) {
                    if (moment(r.vencimento).isBefore(moment()) && r.veiculoId) return r
                }
                return
            }).length

        veiculosAntigos = selectedVehicles
            .filter(v => currentYear - v.anoCarroceria > 14 && v.anoCarroceria !== null)
            .length

        segurosVigentes = selectedVehicles.length - segurosVencidos
        veiculosNovos = selectedVehicles.length - veiculosAntigos
    }
    else {
        segurosVencidos = allExpired
        segurosVigentes = allValid
        veiculosAntigos = oldVehicles
        veiculosNovos = selectedVehicles.length - oldVehicles
    }

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
            segurosVencidos={segurosVencidos}
            segurosVigentes={segurosVigentes}
            oldVehicles={veiculosAntigos}
        />
    )
}

const collections = ['veiculos', 'empresas']

export default StoreHOC(collections, Relatorios)