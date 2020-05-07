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
                            {!selectedVehicle ?
                                'Selecione o veículo para atualizar consultar ou inserir o laudo de segurança veicular.'
                                : `Preencha os campos abaixo para o veículo placa ${selectedVehicle.placa}`
                            }
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
                            <p>
                                Para atualizar ou inserir o laudo, informe o número, a data de vencimento, a empresa que emitiu e anexe o documento referente ao laudo.
                            </p>
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
                                style={{ width: '400px', margin: '15px auto 0 auto' }}
                            />

                            <Button
                                size="small"
                                color='primary'
                                className='saveButton'
                                variant="contained"
                                onClick={() => handleSubmit()}
                                disabled={!laudoDoc ? true : false}
                            >
                                Salvar
                            </Button>
                        </main>
                    }
                    <section>
                        <h4>
                            {!selectedVehicle ?
                                `Veículos com mais de 15 anos: ${filteredVehicles.length}`
                                :
                                `Veículo selecionado: ${selectedVehicle.placa}`
                            }

                        </h4>
                    </section>
                    <section className='placasContainer'>
                        {filteredVehicles.map((v, i) => (
                            //<div key={i} id={v.veiculoId} onClick={() => showDetails(v)} >
                            <div key={i} id={v.veiculoId} onClick={openMenu} >
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