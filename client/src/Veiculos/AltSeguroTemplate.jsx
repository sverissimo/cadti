import React, { Fragment } from 'react'

import Crumbs from '../Utils/Crumbs'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextInput from '../Reusable Components/TextInput'
import AutoComplete from '../Utils/autoComplete'
import Dropzone from 'react-dropzone'

import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'

import Add from '@material-ui/icons/Add'
import AttachFileIcon from '@material-ui/icons/AttachFile';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
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

export default function AltSeguro({ data, enableAddPlaca, handleInput, handleBlur,
    addPlate, addPlateInsurance, deleteInsurance, handleFiles, handleSubmit }) {

    const { selectedEmpresa, placa, apolice, addedPlaca, frota, insuranceExists,
        dropDisplay, seguroFile } = data

    const classes = useStyles(), { paper, textField, chip } = classes

    let placas = []

    if (insuranceExists.hasOwnProperty('placas')) {

        if (insuranceExists.placas[0] !== null) placas = insuranceExists.placas.sort()
        if (placa !== undefined && placa.length > 2 && placas[0]) {
            if (typeof placa === 'string') placas = insuranceExists.placas.filter(p => p.toLowerCase().match(placa.toLowerCase())).sort()
            else placas = insuranceExists.placas.filter(p => p.match(placa)).sort()
        }
    }

    return (
        <Fragment>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Crumbs links={['Veículos', '/veiculos']} text='Seguros' />
                <SelectEmpresa
                    data={data}
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
                    </Paper>
                }
                {selectedEmpresa && (insuranceExists || enableAddPlaca) &&
                    <Paper className={paper}>
                        <p>Utilize as opções abaixo para filtrar, adicionar ou excluir placas desta apólice</p>
                        <div className='addSeguro'>
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

                            <Dropzone onDrop={handleFiles}>
                                {({ getRootProps, getInputProps }) => (
                                    <div className={seguroFile ? 'dropBox fileAttached' : 'dropBox'} {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        {
                                            dropDisplay.match('Clique ou') ?
                                                <div> <AttachFileIcon className='icon' /> <span>  {dropDisplay}</span> </div>
                                                :
                                                <div> <DescriptionOutlinedIcon className='icon' />  {dropDisplay} <br /> (clique ou arraste outro arquivo para alterar)</div>
                                        }
                                    </div>
                                )}
                            </Dropzone>
                        </div>

                        {insuranceExists.hasOwnProperty('apolice') || placas[0]
                            ?
                            <div style={{ margin: '15px' }}>
                                Placas vinculadas a apólice {insuranceExists.apolice}
                            </div>
                            :
                            <div style={{ marginTop: '30px' }}></div>
                        }
                        {insuranceExists && placas[0] && placas.map((placa, i) =>
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
                {//selectedEmpresa && apolice &&

                }
            </div >
            {apolice &&
                <div style={{ minHeight: '60px', position: 'flex' }}>
                    <Button
                        size="small"
                        color='primary'
                        className='saveButton'
                        variant="contained"
                        onClick={() => handleSubmit()}
                        //disabled={!placas[0] || !seguroFile ? true : false}
                    >
                        Salvar <span>&nbsp;&nbsp; </span> <SaveIcon />
                    </Button>
                </div>}
        </Fragment >
    )
}