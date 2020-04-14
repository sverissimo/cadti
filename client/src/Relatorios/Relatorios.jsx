import React, { useEffect, useState } from 'react'
import StoreHOC from '../Store/StoreHOC'

const Relatorios = props => {

    const { veiculos } = props.redux

    const selectedVehicles = veiculos.filter(v => v.delegatarioId === 44)

    /* 
        empresas.forEach(e => {
            compFrota = veiculos.filter(v => e.delegatarioId === v.delegatarioId)
            allFrota = Object.assign(allFrota, { [e.razaoSocial]: compFrota })
            compFrota = []
        })
     */
    /* veiculos.forEach(({ anoCarroceria }) => {
        if (!isNaN(anoCarroceria)) {
            console.log(anoCarroceria)
            soma += anoCarroceria
        }
    }) */


    // **************************MÉDIA****************************
    const idades =
        selectedVehicles
            .map(({ anoCarroceria }) => anoCarroceria)
            .filter(ano => ano !== null)
            .sort()

    let mediaIdades = idades.reduce((a, b) => a + b / idades.length, 0)
    mediaIdades = mediaIdades.toPrecision(6)

    // **************************MODA****************************
    let counter = {}
    idades.forEach(function (e) {
        if (counter[e] === undefined) {
            counter[e] = 0
        }
        counter[e] += 1
    })
    let moda = Object.keys(counter).sort((a, b) => counter[a] - counter[b])
    moda = moda[moda.length - 1]    

    /* 
        Object.keys(allFrota).forEach(empresa => {
            const frota = allFrota[empresa].anoCarroceria || []
            console.log(allFrota, frota)
            array1 = frota.reduce((a, b) => a + b / frota.length, 0)
        })
        console.log(array1) */

    return (
        <div>
            <p>
                A idade média da viação selecionada é {mediaIdades}
            </p>
            <p>
                A moda da idade da viação selecionada é {moda}
            </p>
            As idades são:
            <br />
            {idades.map(i => i + ', ')}
        </div>
    )
}

const collections = ['veiculos', 'empresas']

export default StoreHOC(collections, Relatorios)