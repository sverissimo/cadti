import React from 'react'
import Chart from "react-apexcharts";
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import { barChart, donutChart } from './chartsConfig'

import Paper from '@material-ui/core/Paper'
import './relatorios.css'

const RelatoriosTemplate = ({ empresas, razaoSocial, labels, values, selectedEmpresa, selectedVehicles, mediaIdades, moda, handleInput }) => {

    const colors = ['#ff7c43', '#ffa600', '#FF9800', '#E91E63', '#f95d6a', '#2E93fA', '#66DA26', '#2f4b7c', '#665191', '#a05195', '#d45087', '#003f5c', '#546E7A']

    return (
        <main >
            <SelectEmpresa
                empresas={empresas}
                data={{ razaoSocial }}
                handleInput={handleInput}
            />
            {(!selectedVehicles || selectedVehicles.length === 0) ? <p>Nenhum veículo cadastrado para {selectedEmpresa.razaoSocial}</p>
                :
                <>
                    <h3 style={{ width: '100%', textAlign: 'center' }}>
                        {!selectedEmpresa ? 'Exibindo todos os veículos' : selectedEmpresa.razaoSocial} - média de idade da frota: {mediaIdades} anos, moda: {moda}.
                    </h3>
                    <Paper>
                        <section className='rowContainer'>
                            <Chart
                                options={{ ...barChart.options, xaxis: { ...barChart.options.xaxis, categories: labels } }}
                                series={[{ name: "Veículos", data: values }]}
                                type="bar"
                                width="600"
                            />
                            <Chart
                                options={{ ...donutChart.options, labels, colors }}
                                series={values}
                                type="donut"
                                width="480"
                            />
                        </section>
                    </Paper>
                    <Paper>
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
                    </Paper>
                </>
            }
        </main >
    )
}

export default RelatoriosTemplate