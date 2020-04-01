import React, { Fragment } from 'react'

import Crumbs from '../Utils/Crumbs'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextInput from '../Reusable Components/TextInput'
import AutoComplete from '../Utils/autoComplete'
import DragAndDrop from '../Reusable Components/DragAndDrop'

import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'

import Add from '@material-ui/icons/Add'
import SaveIcon from '@material-ui/icons/Save';
import Search from '@material-ui/icons/Search'

import { seguroForm } from '../Forms/altSegForm'
import './veiculos.css'

const useStyles = makeStyles(theme => ({

    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        margin: theme.spacing(1)
    },
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
        width: 300,
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    },
    chip: {
        margin: theme.spacing(0.5),
    }
}))

export default function AltSeguro({ empresas, data, enableAddPlaca, handleInput, handleBlur,
    addPlate, deleteInsurance, handleFiles, handleSubmit, enableChangeApolice }) {

    const { selectedEmpresa, placa, apolice, addedPlaca, frota, insuranceExists,
        newInsurance, dropDisplay, seguroFile } = data

    const classes = useStyles(), { paper, textField, chip } = classes

    let placas = []
    let insurance

    if (insuranceExists.hasOwnProperty('placas')) insurance = insuranceExists
    else if (newInsurance && newInsurance.placas) insurance = newInsurance

    if (insurance) {
        if (insurance.placas[0] && insurance.placas[0] !== null) placas = insurance.placas.sort()
        if (placa !== undefined && placa.length > 2 && placas[0]) {
            if (typeof placa === 'string') placas = insurance.placas.filter(p => p.toLowerCase().match(placa.toLowerCase())).sort()
            else placas = insurance.placas.filter(p => p.match(placa)).sort()
        }
    }

    return (
        <Fragment>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Crumbs links={['Veículos', '/veiculos']} text='Seguros' />
                <SelectEmpresa
                    data={data}
                    empresas={empresas}
                    handleInput={handleInput}
                    handleBlur={handleBlur}
                />
                {selectedEmpresa &&
                    <Paper className={paper}>
                        <h3 className='formSubtitle'>Informe os dados do seguro.</h3>
                        <TextInput
                            form={seguroForm}
                            data={data}
                            handleBlur={handleBlur}
                            handleInput={handleInput}
                        />
                        {insurance &&
                            <div className='addNewDiv'>
                                <span onClick={()=> enableChangeApolice()}> → Clique aqui para alterar o número da apólice mantendo as placas.</span>
                            </div>
                        }
                    </Paper>
                }
                {selectedEmpresa && (insurance || enableAddPlaca) &&
                    <Paper className={paper}>
                        <p>Utilize as opções abaixo para filtrar, adicionar ou excluir placas desta apólice</p>
                        <section className='addSeguro'>
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
                            <DragAndDrop
                                name='apoliceDoc'
                                formData={seguroFile}
                                dropDisplay={dropDisplay}
                                handleFiles={handleFiles}
                                single={true}
                            />
                        </section>

                        {/********************************* Lista de placas vinculadas (Chips) ********************************************/}

                        {insurance && insurance.placas[0]
                            ?
                            <div style={{ margin: '15px' }}>
                                Placas vinculadas a apólice {insurance.apolice}
                            </div>
                            :
                            <div style={{ marginTop: '30px' }}></div>
                        }
                        {insurance && apolice && apolice.length > 2 && placas[0] && placas.map((placa, i) =>
                            <Chip
                                key={i}
                                label={placa}
                                onDelete={() => deleteInsurance(placa)}
                                className={chip}
                                color='primary'
                                variant="outlined"
                            />
                        )}
                    </Paper>}
            </div >
            {apolice && (insurance || enableAddPlaca) &&
                <div style={{ minHeight: '60px', position: 'flex' }}>
                    <Button
                        size="small"
                        color='primary'
                        className='saveButton'
                        variant="contained"
                        onClick={() => handleSubmit()}
                    // disabled={!placas[0] || !seguroFile ? true : false}
                    >
                        Salvar <span>&nbsp;&nbsp; </span> <SaveIcon />
                    </Button>
                </div>}
        </Fragment >
    )
}