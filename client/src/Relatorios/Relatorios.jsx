import React, { useState } from 'react'
import StoreHOC from '../Store/StoreHOC'
import Chart from "react-apexcharts";
import SelectEmpresa from '../Reusable Components/SelectEmpresa'

import { barChart, donutChart } from './chartsConfig'
import './relatorios.css'

const Relatorios = props => {

    const
        { veiculos, empresas } = props.redux,
        [razaoSocial, setRazaoSocial] = useState(''),
        [selectedEmpresa, setEmpresa] = useState(undefined),
        donutChatOptions = donutChart.options

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
        values = Object.values(counter),
        colors = ['#ff7c43', '#ffa600', '#FF9800', '#E91E63', '#f95d6a', '#2E93fA', '#66DA26', '#2f4b7c', '#665191', '#a05195', '#d45087', '#003f5c', '#546E7A']

    let moda = unsortedLabels.sort((a, b) => counter[a] - counter[b])
    moda = moda[moda.length - 1]

    return (
        <div >
            <SelectEmpresa
                empresas={empresas}
                data={{ razaoSocial }}
                handleInput={handleInput}
            />
            {(!selectedVehicles || selectedVehicles.length === 0) ? <p>Nenhum veículo cadastrado para {selectedEmpresa.razaoSocial}</p>
                :
                <>
                    <h3 style={{ width: '100%', textAlign: 'center' }}>
                        {!selectedEmpresa ? 'Exibindo todos os veículos' : selectedEmpresa.razaoSocial} - idade média da frota: {mediaIdades} anos
                    </h3>
                    <section className='rowContainer'>
                        <Chart
                            options={{ ...barChart.options, xaxis: { ...barChart.options.xaxis, categories: labels } }}
                            series={[{ name: "Veículos", data: values }]}
                            type="bar"
                            width="600"
                        />
                        <Chart
                            options={{ ...donutChatOptions, labels, colors }}
                            series={values}
                            type="donut"
                            width="480"
                        />
                    </section>

                    <section>
                        <table>
                            <thead>
                                <tr>
                                    <th className='tHeader'
                                        style={{ backgroundColor: '#4Ea3eA', color: '#fff' }}
                                        colSpan={labels.length}>Veículos por ano de fabricação - {!selectedEmpresa ? 'Exibindo todos os veículos' : selectedEmpresa.razaoSocial}  </th>
                                </tr>
                                <tr>
                                    {labels.map((l, i) => <th key={l}>{l}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {values.map((d, j) =>
                                        <td className='review' key={j}>
                                            {d}
                                        </td>
                                    )}
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </>
            }
        </div >
    )
}

const collections = ['veiculos', 'empresas']

export default StoreHOC(collections, Relatorios)

{/*  <p>
                A idade média da viação selecionada é {mediaIdades}
            </p>
            <p>
                A moda da idade da viação selecionada é {moda}
            </p>
            As idades são:
            <br />
            {idades.map(i => i + ', ')} */}