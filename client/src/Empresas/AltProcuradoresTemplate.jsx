import React, { Fragment } from 'react'
import Dropzone from 'react-dropzone'
import moment from 'moment'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import SaveIcon from '@material-ui/icons/Save';

import AutoComplete from '../Utils/autoComplete'
import { procuradorForm } from '../Forms/procuradorForm'

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
    input: {
        textAlign: 'center'
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
        padding: '1% 0',
        position: 'absolute',
        bottom: 0
    },
    dropBox: {
        margin: '2% 0',
    },
    dropBoxItem: {
        margin: '1% 0',
        border: '1px solid #ccc',
        borderRadius: '3%',
        height: '60px',
        padding: '2% 1% 0 1%',
        cursor: 'pointer',
        zIndex: '1',
        boxShadow: 'inset 3px -3px -3px 0px black',
        fontWeight: 500,
        color: '#4169E1'

    },
    dropBoxItem2: {
        margin: '1% 0',
        border: '1px solid #ccc',
        borderRadius: '3%',
        height: '60px',
        padding: '0 1% 0 1%',
        cursor: 'pointer',
        zIndex: '1',
        boxShadow: 'inset 3px -3px -3px 0px black',
        color: 'black',
        fontWeight: 400,
    }
}));

export default function ({ handleInput, handleBlur, data, addProc, removeProc,
    showFiles, handleFiles, enableEdit, handleEdit, handleSubmit }) {
    const { procDisplay, razaoSocial, empresas, selectedEmpresa, filteredProc } = data,
        classes = useStyles(), { paper, container, title, iconButton, dropBox,
            dropBoxItem, dropBoxItem2, list, addButton } = classes

    const errorHandler = (el) => {

        const value = data[el.field]

        if (el.pattern && value) {
            return value.match(el.pattern) === null
        }
        if (value > el.max || value < el.min) return true
        else return false
    }

    const helper = (el) => {
        const value = data[el.field]

        if (value > el.max || value < el.min) return 'Valor inválido'
        else if (value && value.match(el.pattern) === null) return '✘'
        else if (el.pattern && value && value.match(el.pattern) !== null) return '✓'
        else return undefined
    }

    const handleDates = (date) => {

        if (date) return moment(date).format('YYYY-MM-DD')
        else return ''
    }

    return (
        <Grid
            container
            direction="row"
            className={container}
            justify="center"
        >
            <Grid>
                <Grid item xs={12}>
                    <Paper className={paper}>
                        <Grid item xs={12} style={{ marginBottom: '15px' }}>
                            <Typography className={title}>  Alteração de procuradores e procurações  - Selecione a Viação</Typography>
                            <TextField
                                inputProps={{
                                    list: 'razaoSocial',
                                    name: 'razaoSocial',
                                }}
                                className={classes.textField}
                                value={razaoSocial}
                                onChange={handleInput}
                                onBlur={handleBlur}
                            />
                            <AutoComplete
                                collection={empresas}
                                datalist='razaoSocial'
                                value={razaoSocial}
                            />
                        </Grid>
                    </Paper>
                </Grid>
                {
                    selectedEmpresa && <Grid item xs={12}>
                        <Paper className={paper}>
                            {
                                procuradorForm.map((el, i) =>
                                    <Fragment key={i}>
                                        <TextField
                                            name={el.field}
                                            label={el.label}
                                            margin='normal'
                                            className={classes.textField}
                                            onChange={handleInput}
                                            onBlur={handleBlur}
                                            type={el.type || ''}
                                            error={errorHandler(el)}
                                            helperText={helper(el)}
                                            select={el.select || false}
                                            value={data[el.field] || ''}
                                            disabled={el.disabled || false}
                                            InputLabelProps={{
                                                className: classes.textField,
                                                shrink: el.type === 'date' || undefined,
                                                style: { fontSize: '0.8rem', fontWeight: 400, color: '#455a64', marginBottom: '5%' }
                                            }}
                                            inputProps={{
                                                style: { background: el.disabled && data.disable ? '#fff' : '#efefef', textAlign: 'center', color: '#000', fontWeight: '500', width: el.width || '' },
                                                value: `${data[el.field] || ''}`,
                                                list: el.datalist || '',
                                                maxLength: el.maxLength || '',
                                                minLength: el.minLength || '',
                                                max: el.max || '',
                                            }}
                                            multiline={el.multiline || false}
                                            rows={el.rows || null}
                                            variant={el.variant || 'filled'}
                                            fullWidth={el.fullWidth || false}
                                        >
                                        </TextField>
                                    </Fragment>
                                )}
                            <Grid container style={{ position: 'relative' }}>
                                <Grid item xs={data.cpfProcurador ? 6 : 12}>
                                    <Dropzone onDrop={handleFiles}>
                                        {({ getRootProps, getInputProps }) => (
                                            <Grid container justify="center" alignItems='center' className={dropBox} direction='row' {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                {
                                                    procDisplay.match('Clique ou') ?
                                                        <Grid item xs={6} className={dropBoxItem}> {procDisplay} </Grid>
                                                        :
                                                        <Grid item xs={6} className={dropBoxItem2}> <DescriptionOutlinedIcon />  {procDisplay} <br /> (clique ou arraste outro arquivo para alterar)</Grid>
                                                }
                                            </Grid>
                                        )}
                                    </Dropzone>
                                </Grid>
                                {data.cpfProcurador && <Grid item xs={6}>
                                    <Button color='primary' className={addButton} onClick={addProc}>
                                        <AddIcon /> Adicionar procurador
                                </Button>
                                </Grid>}
                            </Grid>
                        </Paper>
                    </Grid>
                }
                {
                    selectedEmpresa && filteredProc.length === 0 &&
                    <Grid item xs={12}>
                        <Paper className={paper}>
                            Nenhum procurador cadastrado para {selectedEmpresa.razaoSocial}
                        </Paper>

                    </Grid>
                }
                {
                    filteredProc.length > 0 && <Grid container
                        direction="row"
                        className={container}
                        justify="center"
                        alignItems="center">
                        <Grid item xs={12}>
                            <Paper style={{ padding: '3px' }}>
                                <p className={title}>Procuradores cadastrados</p>
                                {filteredProc.map((p, i) =>
                                    <Grid key={i}>
                                        {procuradorForm.map((e, k) =>
                                            <Fragment key={k + 1000}>
                                                <TextField
                                                    name={e.field}
                                                    defaultValue={e.field === 'vencimento'? handleDates(p[e.field]) : p[e.field]}
                                                    label={e.label}
                                                    type={e.type || 'text'}
                                                    className={list}
                                                    onChange={handleEdit}
                                                    disabled={e.field === 'cpfProcurador' ? true : p.edit ? false : true}
                                                    InputLabelProps={{ shrink: true, style: { fontWeight: 600 } }}
                                                />
                                            </Fragment>
                                        )}
                                        <Button component='span' className={iconButton} title='Ver procuração' onClick={() => showFiles(p.cpfProcurador)}>
                                            <DescriptionOutlinedIcon />
                                        </Button>

                                        <Button component='span' className={iconButton} title='editar' onClick={() => enableEdit(i)}>
                                            <EditIcon />
                                        </Button>

                                        <Button className={iconButton} color='secondary' title='Remover' onClick={() => removeProc(i)}>
                                            <DeleteIcon />
                                        </Button>
                                    </Grid>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                }
                <Grid container direction="row" justify='flex-end' style={{ width: '1200px' }}>
                    <Grid item xs={10} style={{ width: '1000px' }}></Grid>
                    <Grid item xs={1} style={{ align: "right" }}>
                        <Button
                            size="small"
                            color="primary"
                            variant="contained"
                            style={{ margin: '10px 0 10px 0' }}
                            onClick={() => handleSubmit()}
                        >
                            Salvar <span>&nbsp;&nbsp; </span> <SaveIcon />
                        </Button>
                    </Grid>
                </Grid>

            </Grid>
        </Grid>
    )
}