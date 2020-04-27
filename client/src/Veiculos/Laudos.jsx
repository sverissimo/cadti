import React, { useState } from 'react'
import StoreHOC from '../Store/StoreHOC'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import ShowDetails from '../Reusable Components/ShowDetails'

const Laudos = props => {
    const
        { veiculos, empresas } = props.redux,
        currentYear = new Date().getFullYear()

    const
        [razaoSocial, empresaInput] = useState(''),
        [selectedEmpresa, setEmpresa] = useState(),
        [oldVehicles, setOldVehicles] = useState([]),
        [details, setDetails] = useState(false),
        [selectedVehicle, selectVehicle] = useState()

    const handleInput = e => {
        const { value } = e.target
        empresaInput(value)

        let selectedEmpresa = empresas.find(e => e.razaoSocial === value)

        if (selectedEmpresa) {
            setEmpresa(selectedEmpresa)
            if (value !== selectedEmpresa.razaoSocial) setEmpresa(undefined)
            const needsLaudo = veiculos
                .filter(v => v.empresa === value && currentYear - v.anoCarroceria > 14 && v.anoCarroceria !== null)
            setOldVehicles(needsLaudo)
        } else {
            setOldVehicles([])
            setEmpresa()
        }
    }


    const showDetails = async e => {
        /* const { id } = e.target
        let updatedElement
        console.log(id, e.target)
        if (id) updatedElement = veiculos.find(e => e.veiculoId === id) */

        console.log(e)
        if (e) {
            setDetails(!details)
            selectVehicle(e)
        }
        else {
            setDetails(!details)
            selectVehicle(undefined)
        }
    }


    return (
        <div>
            <SelectEmpresa
                empresas={empresas}
                data={{ razaoSocial }}
                handleInput={handleInput}
            />
            {
                selectedEmpresa && <>
                    <h6>Veículos com mais de 15 anos: {oldVehicles.length}</h6>
                    <section className='placasContainer'>
                        {oldVehicles.map((v, i) => (
                            <div key={i} id={v.veiculoId} onClick={() => showDetails(v)} >
                                <div className="placaCity">{selectedEmpresa.cidade}</div>
                                <div className="placaNumber">{v.placa}</div>
                            </div>
                        ))}
                    </section>
                </>
            }
            {details &&
                <ShowDetails
                    close={showDetails}
                    data={{ ...selectedVehicle, tableData: '' }}
                    tab={3}
                    title={'Veículo'}
                    header={'- informações'}

                />
            }
        </div>
    )
}

const collections = ['veiculos', 'empresas']

export default StoreHOC(collections, Laudos)