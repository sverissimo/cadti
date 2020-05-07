import React from 'react'

import { laudoForm } from '../Forms/laudoForm'

import TextInput from '../Reusable Components/TextInput'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import DragAndDrop from '../Reusable Components/DragAndDrop'
import OnClickMenu from '../Reusable Components/OnClickMenu'

import TextField from '@material-ui/core/TextField'
import Search from '@material-ui/icons/Search'
import Button from '@material-ui/core/Button'

const LaudosTemplate = (
    { empresas, razaoSocial, selectedEmpresa, handleInput, filteredVehicles, selectedVehicle, stateInputs, selectOptions,
        openMenu, anchorEl, closeMenu, showDetails, handleFiles, laudoDoc, dropDisplay, handleSubmit }) => {

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
                        <h6>
                            Selecione o veículo para atualizar consultar ou inserir o laudo de segurança veicular.
                        </h6>
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
                    {selectedVehicle &&
                        <main>
                            <h5>
                                Para atualizar ou inserir o laudo, informe o número, a data de vencimento, a empresa que emitiu e anexe o documento referente ao laudo.
                            </h5>
                            <TextInput
                                form={laudoForm}
                                data={stateInputs}
                                handleInput={handleInput}
                                selectOptions={selectOptions}
                            />
                            <DragAndDrop
                                name='laudoDoc'
                                formData={laudoDoc}
                                dropDisplay={dropDisplay}
                                handleFiles={handleFiles}
                                single={true}
                            />

                            <Button
                                size="small"
                                color='primary'
                                className='saveButton'
                                variant="contained"
                                onClick={() => handleSubmit()}
                            // disabled={!placas[0] || !seguroFile ? true : false}
                            >
                                Salvar
                            </Button>

                        </main>
                    }
                    <section>
                        <h4>Veículos com mais de 15 anos: {filteredVehicles.length}</h4>


                    </section>
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
                        }
                        ]}
                    />
                </>
            }
        </div>
    )
}

export default React.memo(LaudosTemplate)
