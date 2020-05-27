import React, { Fragment } from 'react'
import Dropzone from 'react-dropzone'

import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextInput from '../Reusable Components/TextInput'
import { sociosForm } from '../Forms/sociosForm'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

import Button from '@material-ui/core/Button'
import SaveIcon from '@material-ui/icons/Save';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1)
    },
    title: {
        color: '#000',
        fontWeight: 500,
        textAlign: 'center'
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    },
    formHolder: {
        width: 900,
    },
    helperText: {
        marginTop: '4px'
    },
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        margin: theme.spacing(1)
    },
    list: {
        margin: theme.spacing(1),
        width: 180,
        fontSize: '0.7rem',
        fontColor: '#bbb',
        textAlign: 'center',
    },
    iconButton: {
        marginTop: '17px',
        padding: '6px 0px'
    },
    addButton: {
        marginBottom: '1%',
        padding: '1% 0'
    },
    dropBox: {
        margin: '1% 0',
    },
    dropBoxItem: {
        margin: '12px 0',
        border: '1px solid #ccc',
        borderRadius: '3%',
        height: '50px',
        padding: '17px',
        cursor: 'pointer',
        zIndex: '1',
        boxShadow: 'inset 3px -3px -3px 0px black',
        fontSize: '0.75rem',
        color: '#4169E1',
        backgroundColor: '#fafafa'
    },
    dropBoxItem2: {
        margin: '12px 0',
        border: '1px solid #ccc',
        borderRadius: '3%',
        height: '50px',
        padding: '0 1% 0 1%',
        cursor: 'pointer',
        zIndex: '1',
        boxShadow: 'inset 3px -3px -3px 0px black',
        fontSize: '0.75rem',
        color: '#00000',
        backgroundColor: '#fafafa'
    }
}))


export default function AltSociosTemplate({ empresas, data, removeSocio, handleBlur, handleInput,
    addSocio, handleFiles, enableEdit, handleEdit, handleSubmit }) {

    const
        { dropDisplay, filteredSocios, selectedEmpresa } = data,
        classes = useStyles(),
        { paper, container, title, iconButton, dropBox,
            dropBoxItem, dropBoxItem2, list, addButton } = classes   

    return (
        <Grid
            container
            direction="row"
            className={container}
            justify="center"
        >
            <SelectEmpresa
                data={data}
                empresas={empresas}
                handleInput={handleInput}
                handleBlur={handleBlur}
            />
            {
                //selectedEmpresa &&                
                <Grid item xs={12}>
                    <Paper className={paper}>
                        <TextInput
                            form={sociosForm}
                            data={data}
                            handleBlur={handleBlur}
                            handleInput={handleInput}
                        />
                        <Button color='primary' className={addButton} onClick={addSocio}>
                            <AddIcon /> Adicionar sócio
                        </Button>
                    </Paper>
                </Grid>
            }
            {
                selectedEmpresa && filteredSocios.length === 0 &&
                <Grid item xs={12}>
                    <Paper className={paper}>
                        Nenhum sócio cadastrado para {selectedEmpresa.razaoSocial}
                    </Paper>

                </Grid>
            }
            {
                filteredSocios.length > 0 && selectedEmpresa &&
                <Grid container
                    direction="row"
                    className={container}
                    justify="center"
                    alignItems="center">
                    <Grid item xs={12}>
                        <Paper className={paper}>
                            <p className={title}>Sócios cadastrados</p>
                            {filteredSocios.map((s, i) =>
                                <Grid key={i}>
                                    {sociosForm.map((e, k) =>
                                        <Fragment key={k + 1000}>
                                            <TextField
                                                value={s[e.field] || ''}
                                                name={e.field}
                                                label={e.label}
                                                className={list}
                                                disabled={e.field === 'cpfSocio' ? true : s.edit ? false : true}
                                                onChange={handleEdit}
                                                InputLabelProps={{ shrink: true, style: { fontWeight: 600 } }}
                                                inputProps={{ style: { fontSize: '0.8rem' } }}
                                            />
                                        </Fragment>
                                    )}
                                    <Button component='span' className={iconButton} title='editar' onClick={() => enableEdit(i)}>
                                        <EditIcon />
                                    </Button>
                                    <Button className={iconButton} color='secondary' title='Remover' onClick={() => removeSocio(i)}>
                                        <DeleteIcon />
                                    </Button>
                                </Grid>
                            )}
                        </Paper>
                        <Dropzone onDrop={handleFiles}>
                            {({ getRootProps, getInputProps }) => (
                                <Grid container justify="center" alignItems='center' className={dropBox} direction='row' {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    {
                                        dropDisplay.match('Clique ou') ?
                                            <Grid item xs={6} className={dropBoxItem}> {dropDisplay} </Grid>
                                            :
                                            <Grid item xs={6} className={dropBoxItem2}> <DescriptionOutlinedIcon />  {dropDisplay} <br /> (clique ou arraste outro arquivo para alterar)</Grid>
                                    }
                                </Grid>
                            )}
                        </Dropzone>
                        <Grid container direction="row" justify='flex-end' style={{ width: '1200px' }}>
                            <Grid item xs={10} style={{ width: '1000px' }}></Grid>
                            <Grid item xs={1} style={{ align: "right" }}>
                                <Button
                                    size="small"
                                    color="primary"
                                    variant="contained"
                                    style={{ margin: '0px 0 10px 0' }}
                                    onClick={() => handleSubmit()}
                                >
                                    Salvar <span>&nbsp;&nbsp; </span> <SaveIcon />
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            }
        </Grid>
    )
}