import React, { Fragment } from 'react'
import Dropzone from 'react-dropzone'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import SaveIcon from '@material-ui/icons/Save';
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import AutoComplete from '../Utils/autoComplete'
import { sociosForm } from '../Forms/sociosForm'

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
    selector: {
        width: '380px',
        fontSize: '0.8rem',
        margin: '10px 0',
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


export default function AltSociosTemplate({ data, removeSocio, handleBlur, handleInput,
    addSocio, handleFiles, enableEdit, handleEdit, handleSubmit }) {

    const { dropDisplay, razaoSocial, empresas, filteredSocios, form, selectedEmpresa } = data,
        classes = useStyles(), { paper, container, title, iconButton, dropBox,
            dropBoxItem, dropBoxItem2, list, addButton, selector } = classes

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

    return (
        <Grid
            container
            direction="row"
            className={container}
            justify="center"
        >
            <Grid item xs={12}>
                <Paper className={paper}>
                    <Grid item xs={12} style={{ marginBottom: '15px' }}>
                        <Typography className={title}>  Alteração de quadro societário - Selecione a Viação</Typography>
                        <TextField
                            inputProps={{
                                list: 'razaoSocial',
                                name: 'razaoSocial',
                                style: { fontSize: 15, textAlign: 'center' }
                            }}
                            className={selector}
                            value={razaoSocial}
                            onChange={handleInput}
                            placeholder='Selecione a empresa'
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
                selectedEmpresa[0] && <Grid item xs={12}>
                    <Paper className={paper}>
                        {
                            sociosForm.map((el, i) =>
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
                                        disabled={el.disabled}
                                        InputLabelProps={{
                                            className: classes.textField,
                                            shrink: el.type === 'date' || undefined,
                                            style: { fontSize: '0.7rem', color: '#455a64', marginBottom: '5%' }
                                        }}
                                        inputProps={{
                                            style: { background: el.disabled && data.disable ? '#fff' : '#fafafa', height: '7px' },
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

                        <Button color='primary' className={addButton} onClick={addSocio}>
                            <AddIcon /> Adicionar sócio
                        </Button>
                    </Paper>
                </Grid>
            }
            {
                selectedEmpresa[0] && filteredSocios.length === 0 &&
                <Grid item xs={12}>
                    <Paper className={paper}>
                        Nenhum sócio cadastrado para {selectedEmpresa[0].razaoSocial}
                    </Paper>

                </Grid>
            }
            {
                filteredSocios.length > 0 && selectedEmpresa && <Grid container
                    direction="row"
                    className={container}
                    justify="center"
                    alignItems="center">
                    <Grid item xs={12}>
                        <Paper className={paper}>
                            <p className={title}>Sócios cadastrados</p>
                            {filteredSocios.map((s, i) =>
                                <Grid key={i}>
                                    {form.map((e, k) =>
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