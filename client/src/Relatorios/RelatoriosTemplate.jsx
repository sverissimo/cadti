import React from 'react'
import Chart from "react-apexcharts";
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import { barChart, donutChart } from './chartsConfig'

import Paper from '@material-ui/core/Paper'
import './relatorios.css'

const RelatoriosTemplate = ({ empresas, razaoSocial, labels, values, tableLabels, tableData, selectedEmpresa, selectedVehicles, mediaIdades, moda, handleInput }) => {

    const colors = ['#ff7c43', '#ffa600', '#FF9800', '#f95d6a', '#f44336', '#2E93fA', '#3333ff', '#66DA26', '#669999', '#E91E63', '#d45087', '#a05195', '#665191', '#2f4b7c', '#003f5c',]

    return (
        <main className='relatorios'>
            <SelectEmpresa
                empresas={empresas}
                data={{ razaoSocial }}
                handleInput={handleInput}
            />
            {(!selectedVehicles || selectedVehicles.length === 0) ? <p>Nenhum veículo cadastrado para {selectedEmpresa.razaoSocial}</p>
                :
                <>
                    <h3 style={{ width: '100%', textAlign: 'center' }}>
                        {!selectedEmpresa ? 'Exibindo todos os veículos' : selectedEmpresa.razaoSocial} - Média de idade da frota: {mediaIdades} anos. Moda do ano de fabricação: {moda}.
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
                                            style={{ color: '#fff', backgroundColor: 'rgb(84, 110, 122, 0.7)' }}
                                            colSpan={tableLabels.length}>Veículos por ano - {!selectedEmpresa ? 'Exibindo todos os veículos' : selectedEmpresa.razaoSocial}  </th>
                                    </tr>
                                    <tr>
                                        {tableLabels.map((l, i) => <th key={l}>{l}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        tableData.map((tableValues, i) =>
                                            <tr key={i}>
                                                {tableValues.map((d, j) =>
                                                    <td className='review relatorioTD' key={j}>
                                                        {d}
                                                    </td>
                                                )}
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </section>
                    </Paper>
                    <div className="addSpace"> </div>
                </>
            }
        </main >
    )
}

export default RelatoriosTemplate