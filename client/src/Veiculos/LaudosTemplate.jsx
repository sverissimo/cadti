import React from 'react'
import moment from 'moment'

import { laudoForm } from '../Forms/laudoForm'

import Crumbs from '../Utils/Crumbs'
import Placa from '../Reusable Components/Placa'
import TextInput from '../Reusable Components/TextInput'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import CustomTable from '../Reusable Components/CustomTable'
import DragAndDrop from '../Reusable Components/DragAndDrop'
import OnClickMenu from '../Reusable Components/OnClickMenu'

import TextField from '@material-ui/core/TextField'
import Search from '@material-ui/icons/Search'
import StopIcon from '@material-ui/icons/Stop';
import Button from '@material-ui/core/Button'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const LaudosTemplate = (
    { empresas, razaoSocial, selectedEmpresa, filteredVehicles, selectedVehicle, stateInputs, selectOptions,
        anchorEl, laudoDoc, dropDisplay, functions }) => {

    const { handleInput, clickOnPlate, showDetails, formatTable, handleFiles, handleSubmit, closeMenu, clear } = functions

    const renderColor = laudos => {
        if (laudos && laudos[0] && laudos[0].validade) {
            const { validade } = laudos[0]

            if (moment(validade, moment.ISO_8601).isValid() && moment(validade).isAfter(moment().toDate())) return { backgroundColor: 'rgb(13, 136, 13)' }
            if (moment(validade, moment.ISO_8601).isValid() && moment(validade).isBefore(moment().toDate())) return { backgroundColor: 'rgb(197, 128, 0)' }
        }
        else return { backgroundColor: 'rgb(136, 13, 13)' }
    }

    const table = formatTable()

    return (
        <div>
            <Crumbs links={['Veículos', '/veiculos']} text='Laudos' />
            <SelectEmpresa
                empresas={empresas}
                data={{ razaoSocial }}
                handleInput={handleInput}
            />
            {
                selectedEmpresa && <>
                    <header className='flex' style={{ marginBottom: '15px' }}>
                        {
                            !selectedVehicle ?
                                <h5> Selecione o veículo para atualizar consultar ou inserir o laudo de segurança veicular. </h5>
                                :
                                <Placa
                                    veiculoId={selectedVehicle.veiculoId}
                                    onClick={clickOnPlate}
                                    style={{ ...renderColor(selectedVehicle.laudos), marginLeft: 0 }}
                                    city={selectedEmpresa.cidade}
                                    placa={selectedVehicle.placa}
                                />
                        }
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
                        <main className='paper'>
                            <br />
                            <h3 style={{ paddingLeft: '15px', marginTop: '-10px' }}>
                                Para atualizar ou inserir o laudo, informe o número, a data de vencimento, a empresa que emitiu e anexe o documento referente ao laudo.
                            </h3>
                            <br />
                            <br />
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
                                <div className='flex'>
                                    <div>
                                        {`Exibindo ${filteredVehicles.length} veículos com mais de 15 anos.`}
                                    </div>
                                    <div className='flex placasCaption' style={{ fontSize: '0.8rem' }}>
                                        <span>
                                            <span style={{ paddingTop: '5px', color: 'rgb(13, 136, 13)' }}><StopIcon /></span> Laudo vigente
                                        </span>
                                        <span>
                                            <span style={{ paddingTop: '5px', color: 'rgb(197, 128, 0)' }}><StopIcon /></span> Laudo vencido                                            </span>
                                        <span>
                                            <span style={{ paddingTop: '5px', color: 'rgb(136, 13, 13)' }}><StopIcon /></span> Nenhum Laudo cadastrado
                                        </span>
                                    </div>
                                </div>
                                :
                                null
                            }
                        </h4>
                    </section>

                    {!selectedVehicle &&
                        <section className='flex paper' style={{ justifyContent: 'center' }}>
                            {filteredVehicles.map((v, i) => (
                                <Placa
                                    key={i}
                                    veiculoId={v.veiculoId}
                                    onClick={clickOnPlate}
                                    style={renderColor(v.laudos)}
                                    city={selectedEmpresa.cidade}
                                    placa={v.placa}
                                />

                            ))}
                        </section>
                    }

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
            {selectedVehicle && selectedVehicle.laudos &&
                <>
                    {typeof table === 'object' ?
                        <div className="paper" style={{marginTop: '52px', width:'100%', padding: '0', borderRadius: '5px', overflow: 'hidden'}}>
                            <CustomTable
                                length={table.tableHeaders.length}
                                title={`Laudos vinculados ao veículo placa ${selectedVehicle.placa}`}
                                table={table}
                                style={{ textAlign: 'center', padding: '8px 0' }}
                            />
                        </div>
                        :
                        <>
                            <br />
                            <br />
                            <p>{table}</p>
                        </>
                    }
                    <div className='voltarDiv' onClick={clear}>
                        <ArrowBackIcon size='small' />
                        <span style={{ padding: '2px 0 0 2px', marginLeft: '2px', fontSize: '1rem' }}>Voltar</span>
                    </div>
                </>
            }
        </div>
    )
}

export default React.memo(LaudosTemplate)