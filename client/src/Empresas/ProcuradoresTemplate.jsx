import React, { Fragment } from 'react'
import moment from 'moment'

import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import AddCircleOutlineSharpIcon from '@material-ui/icons/AddCircleOutlineSharp';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import AddIcon from '@material-ui/icons/Add';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';

import Procurador from './Procurador'
import DragAndDrop from '../Reusable Components/DragAndDrop'
import { procuradorForm } from '../Forms/procuradorForm'
import StepperButtons from '../Reusable Components/StepperButtons'

import GetAppIcon from '@material-ui/icons/GetApp';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import ShowLocalFiles from '../Reusable Components/ShowLocalFiles'
import { empresaFiles } from '../Forms/empresaFiles'

const divContainer = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    alignContent: 'center',
    flexWrap: 'wrap',
    position: 'relative'
}

const divFiles = {
    textAlign: 'center',
    alignItems: 'flex-start',
    justify: 'space-between',
    lineHeight: '40px',
    border: '1px #ccc solid',
    padding: '0 1%',
    margin: '1% 1% 0.5% 1%',
    fontSize: '0.8rem',
    backgroundColor: '#f6f6f6',
    borderRadius: '6px',
    width: 180
}

const icon = {
    verticalAlign: 'middle',
    cursor: 'pointer',
    paddingLeft: '2%'
}

const fileIcon = {
    verticalAlign: 'middle',
    padding: '0 0% 0 2%',
}

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1),
        height: 'auto',
        backgroundColor: '#fafafa',
    },
    containerList: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(2),
        height: 'auto',
    },
    title: {
        color: '#000',
        textAlign: 'center',
        fontSize: '1.1rem'
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
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center'
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
        padding: '5px 10px 5px 8px',
        height: '40px',
        margin: '5px',
        float: 'right',
        fontSize: '0.8rem'
    },
    dropBox: {
        margin: '30px 0 15px 0',
    }
}));

export default function ({ redux, data, handleInput, addProc, removeProc, handleFiles, getFile, plusOne, minusOne, checkExpires, setShowPendencias, removeFile }) {

    const
        { dropDisplay, selectedEmpresa, procsToAdd, selectedDocs, procuracao, expires, demand, showPendencias, info, demandFiles, fileToRemove } = data,
        { empresas, procuradores } = redux,

        classes = useStyles(), { paper, container, title, dropBox, addButton, paper2, containerList } = classes

    const errorHandler = (el, index) => {

        const value = data[el.field + index]

        if (el.errorHandler && el.errorHandler(value)) return false
        else if (value && el.errorHandler && !el.errorHandler(value)) return true

        if (el.pattern && value) return value.match(el.pattern) === null

        if (value > el.max || value < el.min) return true
        if (value?.length < el?.minLength) return true

        else return false
    }

    const helper = (el, index) => {
        const value = data[el.field + index]

        if (el.errorHandler && el.errorHandler(value)) return '✓'
        else if (value && el.errorHandler && !el.errorHandler(value)) return '✘'

        if (value > el.max || value < el.min) return 'Valor inválido'
        else if (value && value.match(el.pattern) === null) return '✘'
        else if (el.pattern && value && value.match(el.pattern) !== null) return '✓'

        if (value?.length < el?.minLength) return '✘'
        if (value?.length >= el?.minLength) return '✓'

        else return undefined
    }

    const handleDates = (date) => {

        if (date) return moment(date).format('DD-MM-YYYY')
        else return ''
    }

    //************CRIAR FUNÇÃO PARA IMPEDIR QUE O PROCURADOR QUE TENHA ALGUMA PROCURAÇÃO SEJA APAGADO NA TELA 'CONSULTAS' */
    return (
        <Grid
            container
            direction="row"
            className={container}
            justify="flex-start"
        >
            <SelectEmpresa
                data={data}
                empresas={empresas}
                handleInput={handleInput}
            />
            {selectedEmpresa &&
                <Paper className={paper2}>
                    <Typography className={title}> Cadastrar nova procuração </Typography>
                    <h4 style={{ fontWeight: 400, fontSize: '0.9em' }}> Se a procuração abranger mais de um procurador, clique em "+" para adicionar e anexe apenas 1 vez.</h4>
                    {procsToAdd.map((p, j) =>
                        <Grid item xs={12} key={j} style={{ float: 'left' }}>
                            {procuradorForm.map((el, i) =>
                                <Fragment key={i}>
                                    <TextField
                                        name={el.field + j}
                                        label={el.label}
                                        margin='normal'
                                        className={classes.textField}
                                        onChange={e => handleInput(e)}
                                        type={el.type || ''}
                                        error={errorHandler(el, j)}
                                        helperText={helper(el, j)}
                                        select={el.select || false}
                                        value={data[el.field + j] || ''}
                                        disabled={el.disabled || false}
                                        InputLabelProps={{
                                            className: classes.textField,
                                            shrink: el.type === 'date' || undefined,
                                            style: { fontSize: '0.7rem', fontWeight: 400, color: '#888' }
                                        }}
                                        inputProps={{
                                            style: {
                                                background: el.disabled && data.disable ? '#fff' : '#fafafa',
                                                fontSize: '0.9rem', textAlign: 'center', color: '#000', width: el.width || 150, height: '7px'
                                            },
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
                                                    bottom: '136px',
                                                    right: j > 0 ? '15px' : '35px',
                                                    color: '#009688',
                                                    fontSize: 30,
                                                    cursor: 'pointer',
                                                    zIndex: 1
                                                }}
                                            />
                                            {j > 0 && <RemoveCircleOutlineIcon
                                                onClick={() => minusOne()}
                                                style={{
                                                    verticalAlign: 'middle',
                                                    position: 'absolute',
                                                    bottom: '136px',
                                                    right: '45px',
                                                    color: 'red',
                                                    fontSize: 30,
                                                    cursor: 'pointer',
                                                    zIndex: 1
                                                }}
                                            />}
                                        </>
                                    }
                                </Fragment>
                            )}
                        </Grid>
                    )}
                    <Grid container style={{ position: 'relative', alignItems: 'center' }}>
                        <Grid item xs={6}>
                            {!demand ?
                                <DragAndDrop
                                    style={{ marginTop: '22px', width: '90%' }}
                                    name='procuracao'
                                    formData={procuracao}
                                    dropDisplay={dropDisplay}
                                    handleFiles={handleFiles}
                                    demandFiles={demandFiles}
                                    removeFile={removeFile}
                                    fileToRemove={fileToRemove}
                                />
                                :
                                <div className="flex">
                                    <ShowLocalFiles
                                        demand={demand}
                                        collection='empresaDocs'
                                        demandFiles={demandFiles}
                                        form={empresaFiles}
                                        style={{ minWidth: '220px' }}
                                    />
                                </div>
                            }
                        </Grid>
                        <Grid item xs={6} className={dropBox}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginRight: '67px' }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={expires === true}
                                            onChange={() => checkExpires()}
                                            value={expires}
                                        />
                                    }
                                    label={

                                        <span style={{ color: '#2979ff', fontSize: '0.8em', float: 'right' }}>
                                            Procuração por prazo determinado?
                                    </span>
                                    }
                                />
                                <TextField
                                    name='vencimento'
                                    label='Vencimento'
                                    margin='normal'
                                    className={classes.textField}
                                    onChange={e => handleInput(e)}
                                    type='date'
                                    helper='se indeterminado, deixar em branco'
                                    value={data.vencimento || ''}
                                    disabled={expires === false}
                                    InputLabelProps={{
                                        className: classes.textField,
                                        shrink: true,
                                        style: { fontSize: '0.8rem', color: '#455a64', marginBottom: '5%' }
                                    }}
                                    inputProps={{
                                        style: { background: '#fafafa', fontSize: '0.8rem', textAlign: 'center', color: '#000', height: '9px' },
                                    }}
                                    variant={'filled'}
                                />

                            </div>
                        </Grid>
                    </Grid>
                </Paper>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                {selectedEmpresa && !demand ?
                    <Button
                        className={addButton}
                        size='small'
                        color="secondary"
                        variant="contained"
                        onClick={() => addProc()}
                    >
                        <AddIcon />Cadastrar procuração
                        </Button>
                    : selectedEmpresa && demand ?
                        <StepperButtons
                            uniqueStep={true}
                            declineButtonLabel='Indeferir'
                            demand={demand}
                            setShowPendencias={setShowPendencias}
                            showPendencias={showPendencias}
                            info={info}
                            handleSubmit={addProc}
                            handleInput={handleInput}
                        />
                        : null
                }
            </div>

            {selectedEmpresa && selectedDocs[0] && <h2 style={{ margin: '25px 0 0 15px' }}>Procurações cadastradas</h2>
            }
            {
                selectedEmpresa && !selectedDocs[0] && !demand &&
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
                        <Paper style={{ padding: '10px 15px 20px 15px' }}>
                            <p className={title}>Procuração {
                                !procuracao.vencimento ?
                                    'por prazo indeterminado'
                                    :
                                    'com vencimento em ' + handleDates(procuracao.vencimento)
                            }</p>

                            <Procurador procuradores={procuradores} procuracao={procuracao} />

                            <div style={divContainer}>
                                <span style={divFiles}>
                                    <InsertDriveFileOutlinedIcon style={fileIcon} />
                                    <span style={{ verticalAlign: 'middle', }}>
                                        {' '} Baixar arquivo
                                    </span>
                                    <GetAppIcon style={icon} onClick={() => getFile(procuracao.procuracaoId)} />
                                </span>
                                <span style={{ ...divFiles, width: 90, backgroundColor: 'white', border: 0, position: 'absolute', right: 0 }}>
                                    <DeleteOutlinedIcon color='secondary' style={icon} onClick={() => removeProc(procuracao)} />
                                    Apagar
                                    </span>
                            </div>
                        </Paper>
                    </Grid>
                </Grid>
                )
            }
        </Grid >
    )
}