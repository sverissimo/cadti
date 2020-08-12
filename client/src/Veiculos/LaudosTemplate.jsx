import React from 'react'
import moment from 'moment'

import { laudoForm } from '../Forms/laudoForm'

import Crumbs from '../Reusable Components/Crumbs'
import Placa from '../Reusable Components/Placa'
import TextInput from '../Reusable Components/TextInput'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import CustomTable from '../Reusable Components/CustomTable'
import DragAndDrop from '../Reusable Components/DragAndDrop'
import OnClickMenu from '../Reusable Components/OnClickMenu'
import FormSubtiltle from '../Reusable Components/FormSubtiltle'
import ShowLocalFiles from '../Reusable Components/ShowLocalFiles'
import StepperButtons from '../Reusable Components/StepperButtons'

import TextField from '@material-ui/core/TextField'
import Search from '@material-ui/icons/Search'
import StopIcon from '@material-ui/icons/Stop';
import Button from '@material-ui/core/Button'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const LaudosTemplate = (
    { empresas, razaoSocial, selectedEmpresa, filteredVehicles, selectedVehicle, stateInputs, selectOptions, table,
        anchorEl, laudoDoc, dropDisplay, functions, demand, demandFiles, showPendencias, info, fileToRemove }) => {

    const
        { placa } = selectedVehicle,
        { handleInput, clickOnPlate, showDetails, handleFiles, handleSubmit, closeMenu, clear,
            removeFile, deleteLaudo, setShowPendencias } = functions


    const renderColor = laudos => {
        if (laudos && laudos[0] && laudos[0].validade) {
            const { validade } = laudos[0]

            if (moment(validade, moment.ISO_8601).isValid() && moment(validade).isAfter(moment().toDate())) return { backgroundColor: 'rgb(13, 136, 13)' }
            if (moment(validade, moment.ISO_8601).isValid() && moment(validade).isBefore(moment().toDate())) return { backgroundColor: 'rgb(197, 128, 0)' }
        }
        else return { backgroundColor: 'rgb(136, 13, 13)' }
    }

    const deleteIconProperties = {
        color: 'secondary',
        title: 'Apagar Laudo',
        style: { cursor: 'pointer' }
    }

    return (
        <React.Fragment>
            <Crumbs links={['Veículos', '/veiculos']} text='Laudos' demand={demand} selectedEmpresa={selectedEmpresa} />
            <div style={demand ? { marginTop: '15px' } : {}}>
                <SelectEmpresa
                    empresas={empresas}
                    data={{ razaoSocial, demand }}
                    headerTitle={placa && selectedEmpresa && `Cadastro de laudo veicular ${placa} - ${selectedEmpresa?.razaoSocial}`}
                    handleInput={handleInput}
                />
            </div>
            {
                selectedEmpresa && <>
                    {!demand &&
                        <header className='flex' style={{ marginBottom: '15px', justifyContent: 'space-between' }}>
                            {
                                !selectedVehicle ?
                                    <FormSubtiltle subtitle='Selecione o veículo para atualizar consultar ou inserir o laudo de segurança veicular.' />
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
                                <Search style={{ marginTop: '10px' }} />
                            </div>
                        </header>
                    }
                    {selectedVehicle && <>
                        <main className='paper' style={demand ? { marginTop: '15px' } : {}}>
                            <FormSubtiltle
                                subtitle={
                                    !demand ?
                                        'Para inserir novo laudo, informe o número, a data de vencimento, a empresa que emitiu e anexe o documento referente ao laudo.'
                                        :
                                        'Verifique as informações abaixo, confira com o laudo anexo e escolha uma das opções abaixo.'
                                }
                            />

                            <br />
                            <br />
                            <TextInput
                                form={laudoForm}
                                data={stateInputs}
                                handleInput={handleInput}
                                selectOptions={selectOptions}
                            />
                            {!demand ? <DragAndDrop
                                name='laudoDoc'
                                formData={laudoDoc}
                                dropDisplay={dropDisplay}
                                handleFiles={handleFiles}
                                removeFile={removeFile}
                                fileToRemove={fileToRemove}
                                single={true}
                                style={{ width: '400px', margin: '15px auto 0 auto' }}
                            />
                                : demandFiles &&
                                <ShowLocalFiles
                                    demand={demand}
                                    collection='vehicleDocs'
                                    demandFiles={demandFiles}
                                    form={[{ title: 'Laudo veicular', name: 'laudoDoc' }]}
                                //files={files}
                                />
                            }
                        </main>
                        <section>
                            {
                                selectedEmpresa && !demand ?
                                    <Button
                                        size="small"
                                        color='primary'
                                        className='saveButton'
                                        variant="contained"
                                        onClick={() => handleSubmit()}
                                    //   disabled={!laudoDoc ? true : false}
                                    >
                                        Cadastrar Laudo
                                    </Button>
                                    : selectedEmpresa && demand ?
                                        <StepperButtons
                                            uniqueStep={true}
                                            declineButtonLabel='Indeferir'
                                            demand={demand}
                                            setShowPendencias={() => setShowPendencias(!showPendencias)}
                                            showPendencias={showPendencias}
                                            info={info}
                                            handleSubmit={handleSubmit}
                                            handleInput={handleInput}
                                        />
                                        : null
                            }
                        </section>
                    </>
                    }

                    <section>
                        <h4>
                            {!selectedVehicle ?
                                <div className='flex' style={{ justifyContent: 'space-between' }}>
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
                        <section className='center flex paper'>
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
            {
                selectedVehicle && selectedVehicle.laudos && !demand &&
                <>
                    {typeof table === 'object' ?
                        <div className="paper" style={{ marginTop: '52px', width: '100%', padding: '0', borderRadius: '5px', overflow: 'hidden' }}>
                            <CustomTable
                                length={table.tableHeaders.length}
                                title={`Laudos vinculados ao veículo placa ${selectedVehicle.placa}`}
                                table={table}
                                style={{ textAlign: 'center', padding: '8px 0' }}
                                deleteIconProperties={deleteIconProperties}
                                deleteFunction={deleteLaudo}
                                idIndex={1}
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
        </React.Fragment >
    )
}

export default React.memo(LaudosTemplate)