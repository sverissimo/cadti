/* import React, { useEffect, useState } from 'react'
import StoreHOC from '../Store/StoreHOC'
import Chart from "react-apexcharts";
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import './relatorios.css'


const Relatorios = ({ data, test }) => {


    return (
        <div className='rowContainer'>
            <SelectEmpresa />
            <Chart
                options={data.options}
                series={data.series}
                type="bar"
                width="500"
            />
            <Chart
                options={test.options}
                series={test.series}
                type="donut"
                width="480"
            />
        </div>
    )
}

const collections = ['veiculos', 'empresas']

export default StoreHOC(collections, Relatorios)
 */
{/*  <p>
                A idade média da viação selecionada é {mediaIdades}
            </p>
            <p>
                A moda da idade da viação selecionada é {moda}
            </p>
            As idades são:
            <br />
            {idades.map(i => i + ', ')} */}