import React, { Fragment } from 'react'
import Dropzone from 'react-dropzone'
import moment from 'moment'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

import AddCircleOutlineSharpIcon from '@material-ui/icons/AddCircleOutlineSharp';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import AddIcon from '@material-ui/icons/Add';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import SaveIcon from '@material-ui/icons/Save';

import Procurador from './Procurador'
import AutoComplete from '../Utils/autoComplete'
import { procuradorForm } from '../Forms/procuradorForm'

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1),
        minHeight:'80vh',
        height: 'auto'
    },
    containerList: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1),
        height: 'auto'
    },
    title: {
        color: '#000',
        fontWeight: 400,
        fontSize: '1.2rem',
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
        margin: theme.spacing(1),
    },
    paper2: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        margin: theme.spacing(1),
        position: 'relative'
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
        padding: '20px 15px 0 15px',
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
    showFiles, handleFiles, enableEdit, handleEdit, handleSubmit, plusOne, minusOne }) {
    const { procDisplay, razaoSocial, empresas, selectedEmpresa, procsToAdd, selectedDocs,
        procuracoesArray, procuradores } = data,

        classes = useStyles(), { paper, container, title,  dropBox,
            dropBoxItem, dropBoxItem2, addButton, paper2, containerList } = classes

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

        if (date) return moment(date).format('DD-MM-YYYY')
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
                            <Typography className={title}>  Gerenciar procurações - Selecione a Empresa</Typography>
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
                {true && <Paper className={paper2}>
                    <Typography className={title}> Cadastrar nova procuração </Typography>
                    <h6> Se a procuração abranger mais de um procurador, clique em "+" para adicionar e anexe apenas 1 vez.</h6>
                    {procsToAdd.map((p, j) =>
                        <Grid item xs={12} key={j}>
                            {procuradorForm.map((el, i) =>
                                <Fragment key={i}>
                                    <TextField
                                        name={el.field + j}
                                        label={el.label}
                                        margin='normal'
                                        className={classes.textField}
                                        onChange={e => handleInput(e)}
                                        onBlur={handleBlur}
                                        type={el.type || ''}
                                        error={errorHandler(el)}
                                        helperText={helper(el)}
                                        select={el.select || false}
                                        value={data[el.field + j] || ''}
                                        disabled={el.disabled || false}
                                        InputLabelProps={{
                                            className: classes.textField,
                                            shrink: el.type === 'date' || undefined,
                                            style: { fontSize: '0.8rem', fontWeight: 400, color: '#455a64', marginBottom: '5%' }
                                        }}
                                        inputProps={{
                                            style: { background: el.disabled && data.disable ? '#fff' : '#efefef', textAlign: 'center', color: '#000', fontWeight: '500', width: el.width || '' },
                                            value: `${data[el.field + j] || ''}`,
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
                                    {j === procsToAdd.length - 1 && i === 3 &&
                                        <>
                                            <AddCircleOutlineSharpIcon
                                                onClick={() => plusOne()}
                                                style={{
                                                    verticalAlign: 'middle',
                                                    position: 'absolute',
                                                    bottom: '27px',
                                                    right: j > 0 ? '0px' : '15px',
                                                    color: '#009688',
                                                    fontSize: 30,
                                                    cursor: 'pointer'
                                                }}
                                            />
                                            {j > 0 && <RemoveCircleOutlineIcon
                                                onClick={() => minusOne()}
                                                style={{
                                                    verticalAlign: 'middle',
                                                    position: 'absolute',
                                                    bottom: '27px',
                                                    right: '28px',
                                                    color: 'red',
                                                    fontSize: 30,
                                                    cursor: 'pointer'
                                                }}
                                            />}
                                        </>
                                    }
                                </Fragment>
                            )}
                        </Grid>
                    )}
                </Paper>}
                <Grid container style={{ position: 'relative' }}>
                    <Grid item xs={6}>
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
                    <Grid item xs={6}>
                        <TextField
                            name='vencimento'
                            label='Vencimento'
                            margin='normal'
                            className={classes.textField}
                            onChange={e => handleInput(e)}
                            type='date'
                            helper='se indeterminado, deixar em branco'
                            value={data.vencimento}
                            InputLabelProps={{
                                className: classes.textField,
                                shrink: true,
                                style: { fontSize: '0.8rem', fontWeight: 400, color: '#455a64', marginBottom: '5%' }
                            }}
                            inputProps={{
                                style: { background: '#efefef', textAlign: 'center', color: '#000', fontWeight: '500' },
                                value: data.vencimento
                            }}
                            variant={'filled'}
                        />
                    </Grid>
                    {//data.cpfProcurador && <Grid item xs={6}>
                        <Grid item xs={12}>
                            <Button color='primary' className={addButton} onClick={addProc} style={{ position: 'absolute', right: 0 }}>
                                <AddIcon /> Adicionar procurador
                        </Button>
                        </Grid>}
                </Grid>
                {
                    selectedEmpresa && procuracoesArray.length === 0 &&
                    <Grid item xs={12}>
                        <Paper className={paper}>
                            Nenhum procurador cadastrado para {selectedEmpresa.razaoSocial}
                        </Paper>

                    </Grid>
                }
                {
                    selectedDocs.length > 0 && selectedDocs.map((procuracao, z) => <Grid container
                        key={z * 0.01}
                        direction="row"
                        className={containerList}
                        justify="center"
                        alignItems="flex-start">
                        <Grid item xs={12}>
                            <Paper style={{ padding: '2px' }}>
                                <p className={title}>Procuração {
                                    procuracao.indeterminada ?
                                        'por prazo indeterminado'
                                        :
                                        'com vencimento em ' + handleDates(procuracao.vencimento)
                                }</p>
                                <Procurador
                                    procuradores={procuradores}
                                    procuracao={procuracao} />
                            </Paper>
                        </Grid>
                    </Grid>
                    )}
                <Grid container direction="row" justify='flex-start' style={{ width: '1200px' }}>
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