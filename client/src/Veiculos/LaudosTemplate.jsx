import React from 'react'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import OnClickMenu from '../Reusable Components/OnClickMenu'
import TextField from '@material-ui/core/TextField'
import Search from '@material-ui/icons/Search'

const LaudosTemplate = (
    { empresas, razaoSocial, selectedEmpresa, handleInput, filteredVehicles, openMenu, anchorEl, closeMenu, showDetails, openDialog }) => {

    return (
        <div>
            <SelectEmpresa
                empresas={empresas}
                data={{ razaoSocial }}
                handleInput={handleInput}
            />
            {
                selectedEmpresa && <>
                    <header className='container laudos'>
                        <h6>Veículos com mais de 15 anos: {filteredVehicles.length}</h6>
                        <div>
                            <TextField
                                inputProps={{ name: 'placa' }}
                                InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                                label='Filtrar'
                                onChange={handleInput}
                            />
                            <Search style={{ marginTop: '18px' }} />
                        </div>
                    </header>
                    <section className='placasContainer'>
                        {filteredVehicles.map((v, i) => (
                            //<div key={i} id={v.veiculoId} onClick={() => showDetails(v)} >
                            <div key={i} id={v.veiculoId} onClick={openMenu}>
                                <div className="placaCity">{selectedEmpresa.cidade}</div>
                                <div className="placaCode">{v.placa}</div>

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
                            onClick: () => openDialog(true)
                        }]}
                    />
                </>
            }
        </div>
    )
}

export default LaudosTemplate
