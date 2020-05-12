import React from 'react'
import moment from 'moment'

import { laudoForm } from '../Forms/laudoForm'

import TextInput from '../Reusable Components/TextInput'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import StandardTable from '../Reusable Components/StandardTable'
import DragAndDrop from '../Reusable Components/DragAndDrop'
import OnClickMenu from '../Reusable Components/OnClickMenu'

import TextField from '@material-ui/core/TextField'
import Search from '@material-ui/icons/Search'
import Button from '@material-ui/core/Button'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const LaudosTemplate = (
    { empresas, razaoSocial, selectedEmpresa, filteredVehicles, selectedVehicle, stateInputs, selectOptions,
        anchorEl, laudoDoc, dropDisplay, functions }) => {

    const { handleInput, clickOnPlate, showDetails, formatTable, handleFiles, handleSubmit, closeMenu, clear } = functions

    const renderColor = laudos => {
        if (laudos && laudos[0] && laudos[0].validade) {
            const { validade } = laudos[0]

            if (moment(validade).isValid() && moment(validade).isAfter(moment().toDate())) return { backgroundColor: 'rgb(13, 136, 13)' }
            if (moment(validade).isValid() && moment(validade).isBefore(moment().toDate())) return
            //console.log(moment(validade).isAfter(moment().toDate()))           
        }
        else return  { backgroundColor: 'rgb(136, 13, 13)' }
    }

    const table = formatTable()

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
                        <h5>
                            {!selectedVehicle ?
                                'Selecione o veículo para atualizar consultar ou inserir o laudo de segurança veicular.'
                                : `Preencha os campos abaixo para o veículo placa ${selectedVehicle.placa}`
                            }
                        </h5>
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
                                <>
                                    {`Exibindo ${filteredVehicles.length} veículos com mais de 15 anos.`} <br />
                                    <span style ={{ color: 'rgb(13, 136, 13)' }}>Laudo vigente</span><br />
                                    <span style ={{ color: 'rgb(197, 128, 0)' }}>Laudo vencido</span><br />
                                    <span style ={{ color: 'rgb(136, 13, 13)' }}>Nenhum Laudo cadastrado</span><br />

                                </>
                                :
                                `Veículo selecionado: ${selectedVehicle.placa}`
                            }
                        </h4>
                    </section>
                    <section className='placasContainer'>
                        {filteredVehicles.map((v, i) => (
                            //<div key={i} id={v.veiculoId} onClick={() => showDetails(v)} >
                            <div key={i} id={v.veiculoId} onClick={clickOnPlate} style={renderColor(v.laudos)}>
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
            {selectedVehicle && selectedVehicle.laudos &&
                <>
                    {typeof table === 'object' ? <StandardTable
                        length='3'
                        title='Laudos vinculados a este veículo'
                        labels={table.labels}
                        values={table.values}
                    /> :
                        <p>{table}</p>
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