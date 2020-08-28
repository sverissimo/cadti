import React, { Fragment } from 'react'

import Crumbs from '../Reusable Components/Crumbs'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextInput from '../Reusable Components/TextInput'
import AutoComplete from '../Utils/autoComplete'
import DragAndDrop from '../Reusable Components/DragAndDrop'
import StepperButtons from '../Reusable Components/StepperButtons'

import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'

import Add from '@material-ui/icons/Add'
import SaveIcon from '@material-ui/icons/Save';
import Search from '@material-ui/icons/Search'

import { seguroForm } from '../Forms/seguroForm'
import './veiculos.css'
import ShowLocalFiles from '../Reusable Components/ShowLocalFiles'
import { empresaFiles } from '../Forms/empresaFiles'

const useStyles = makeStyles(theme => ({

    title: {
        color: '#000',
        fontWeight: 400,
        fontSize: '0.9rem',
        textAlign: 'center',
        marginBottom: '20px'
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: '25%',
        minWidth: 310,
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    },
    chip: {
        margin: theme.spacing(0.5),
    }
}))

export default function SegurosTemplate({ empresas, data, seguradoras, enableAddPlaca, handleInput, handleBlur,
    addPlate, removeFromInsurance, handleFiles, handleSubmit, enableChangeApolice, showAllPlates, removeFile, setShowPendencias }) {

    const { selectedEmpresa, placa, apolice, addedPlaca, frota, insuranceExists, demandFiles, fileToRemove, demand,
        insurance, dropDisplay, apoliceDoc, showPendencias, info } = data

    const classes = useStyles(), { textField, chip } = classes

    data.seguradoras = seguradoras

    let placas = []

    if (insurance && insurance.placas) {
        if (insurance.placas[0] && insurance.placas[0] !== null) placas = insurance.placas.sort()
        if (placa !== undefined && placa.length > 2 && placas[0]) {
            if (typeof placa === 'string') placas = insurance.placas.filter(p => p.toLowerCase().match(placa.toLowerCase())).sort()
            else placas = insurance.placas.filter(p => p.match(placa)).sort()
        }
    }

    return (
        <Fragment>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Crumbs links={['Veículos', '/veiculos']} text='Seguros' demand={demand} />
                <SelectEmpresa
                    data={data}
                    empresas={empresas}
                    handleInput={handleInput}
                    handleBlur={handleBlur}
                />
                {selectedEmpresa &&
                    <section className="paper">
                        <h3 className='formSubtitle'>Informe os dados do seguro.</h3>
                        <TextInput
                            form={seguroForm}
                            data={data}
                            handleBlur={handleBlur}
                            handleInput={handleInput}
                        />
                        {insuranceExists &&
                            <div className='addNewDiv'>
                                <span onClick={() => enableChangeApolice()}> → Clique aqui para alterar o número da apólice mantendo as placas.</span>
                            </div>
                        }
                    </section>
                }
                {
                    selectedEmpresa && enableAddPlaca &&
                    <main className='paper' style={{ textAlign: 'center', color: '#555' }}>
                        <p>Utilize as opções abaixo para filtrar, adicionar ou excluir placas desta apólice</p>
                        <section className='flex spaceBetween' style={{ paddingTop: '17px' }}>
                            <div>
                                <TextField
                                    inputProps={{
                                        name: 'addedPlaca',
                                        list: 'placa'
                                    }}
                                    InputLabelProps={{
                                        style: { fontSize: '0.8rem' }
                                    }}
                                    label='Insira a placa'
                                    className={textField}
                                    value={addedPlaca}
                                    onChange={handleInput}
                                    onBlur={handleBlur}
                                />
                                <AutoComplete
                                    collection={frota}
                                    datalist='placa'
                                    value={addedPlaca}
                                />
                                <Button
                                    size="small"
                                    variant="contained"
                                    className={classes.button}
                                    style={{ margin: '10px 0 10px 0' }}
                                    onClick={() => addPlate(addedPlaca)}
                                >
                                    <Add /> Adicionar
                            </Button>
                            </div>

                            <div>
                                <TextField
                                    inputProps={{
                                        name: 'placa',
                                    }}
                                    InputLabelProps={{
                                        style: { fontSize: '0.8rem' }
                                    }}
                                    label='Filtrar'
                                    className={textField}
                                    value={placa || ''}
                                    onChange={handleInput}
                                    onBlur={handleBlur}
                                />
                                <Search style={{ marginTop: '18px' }} />
                            </div>

                            {!demand ?
                                <DragAndDrop
                                    name='apoliceDoc'
                                    formData={apoliceDoc}
                                    dropDisplay={dropDisplay}
                                    handleFiles={handleFiles}
                                    demandFiles={demandFiles}
                                    removeFile={removeFile}
                                    fileToRemove={fileToRemove}
                                    style={{ padding: '0 10px', margin: '0 10px', width: '28%', minWidth: '320px' }}
                                />
                                : demandFiles[0] &&
                                <div style={{ width: '225px', marginTop: '15px' }}>
                                    <ShowLocalFiles
                                        demand={demand}
                                        collection='empresaDocs'
                                        demandFiles={demandFiles}
                                        form={empresaFiles}
                                        style={{ width: '200px' }}
                                    //files={files}
                                    />
                                </div>
                            }

                        </section>

                        <div className='addNewDiv' style={{ justifyContent: 'flex-start', padding: '10px' }}>
                            <span onClick={() => showAllPlates()}>→ Clique aqui para selecionar placas</span>
                        </div>

                        {/********************************* Lista de placas vinculadas (Chips) ********************************************/}

                        {insurance?.placas && insurance?.placas[0]
                            ?
                            <div style={{ marginTop: '15px' }}>
                                Placas vinculadas a apólice {insurance.apolice}
                            </div>
                            :
                            <div style={{ marginTop: '30px' }}></div>
                        }
                        {insurance && insurance.placas && apolice && apolice.length > 2 && placas[0] &&
                            <>
                                <p style={{ fontSize: '0.7rem', marginBottom: '10px', marginTop: '3px', color: '#787b6e' }} >
                                    Selecionado{placas.length > 1 ? 's' : ''} {placas.length} veículo{placas.length > 1 ? 's' : ''} de {frota?.length}
                                </p>
                                {
                                    placas.map((placa, i) =>
                                        <Chip
                                            key={i}
                                            label={placa}
                                            onDelete={() => removeFromInsurance(placa)}
                                            className={chip}
                                            color='primary'
                                            variant="outlined"
                                        />
                                    )
                                }
                            </>
                        }
                    </main>}
            </div >
            {
                apolice && (insurance || enableAddPlaca) && !demand ?
                    <div style={{ minHeight: '60px', position: 'flex' }}>
                        <Button
                            size="small"
                            color='primary'
                            className='saveButton'
                            variant="contained"
                            onClick={() => handleSubmit()}
                            disabled={!placas[0] || !apoliceDoc ? true : false}
                        >
                            Salvar <span>&nbsp;&nbsp; </span> <SaveIcon />
                        </Button>
                    </div>
                    :
                    selectedEmpresa && demand ?
                        <StepperButtons
                            uniqueStep={true}
                            declineButtonLabel='Indeferir'
                            demand={demand}
                            setShowPendencias={setShowPendencias}
                            showPendencias={showPendencias}
                            info={info}
                            handleSubmit={handleSubmit}
                            handleInput={handleInput}
                        />
                        : null
            }
        </Fragment >
    )
}