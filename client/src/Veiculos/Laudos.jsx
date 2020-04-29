import React, { useState, useEffect } from 'react'
import StoreHOC from '../Store/StoreHOC'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import ShowDetails from '../Reusable Components/ShowDetails'
import OnClickMenu from '../Reusable Components/OnClickMenu'

const Laudos = props => {

    const
        { veiculos, empresas } = props.redux,
        currentYear = new Date().getFullYear()

    const
        [razaoSocial, empresaInput] = useState(''),
        [selectedEmpresa, setEmpresa] = useState(),
        [oldVehicles, setOldVehicles] = useState([]),
        [details, setDetails] = useState(false),
        [selectedVehicle, selectVehicle] = useState(),
        [anchorEl, setAnchorEl] = React.useState(null);

    const openMenu = async (event) => {
        event.persist()
        const { id } = event.target
        let vehicle
        if (id) vehicle = veiculos.find(v => v.veiculoId.toString() === id)

        await selectVehicle(vehicle)        

        setAnchorEl(event.target);
    };

    const closeMenu = () => setAnchorEl(null)

    useEffect(() => { document.addEventListener('keydown', escFunction, false) })


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


    const showDetails = async () => {

        if (selectedVehicle) { 
            await setDetails(!details) 
            setAnchorEl(null)
        }
        else {
            setDetails(false)
            selectVehicle(undefined)
            setAnchorEl(null)
        }
    }

    const escFunction = e => { if (e.keyCode === 27 && details) setDetails(false) }

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
                            //<div key={i} id={v.veiculoId} onClick={() => showDetails(v)} >
                            <div key={i} id={v.veiculoId} onClick={openMenu}>
                                <div className="placaCity">{selectedEmpresa.cidade}</div>
                                <div className="placaNumber">{v.placa}</div>

                            </div>
                        ))}
                    </section>
                    <OnClickMenu
                        anchorEl={anchorEl}
                        handleClose={closeMenu}
                        menuOptions={[{
                            title: 'Detalhes',
                            onClick: showDetails
                        },
                        {
                            title: 'Atualizar laudo',
                            onClick: showDetails
                        }]}
                    />
                </>
            }
            {
                details && <ShowDetails
                    close={showDetails}
                    data={{ ...selectedVehicle, tableData: '' }}
                    tab={3}
                    title={'Veículo'}
                    header={'- informações'}
                />
            }
        </div >
    )
}

const collections = ['veiculos', 'empresas']
export default StoreHOC(collections, Laudos)