import React, { Fragment } from 'react'
import moment from 'moment'

import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import AddCircleOutlineSharpIcon from '@material-ui/icons/AddCircleOutlineSharp';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import AddIcon from '@material-ui/icons/Add';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import GetAppIcon from '@material-ui/icons/GetApp';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';

import Procurador from './Procurador'
import { procuradorForm } from './forms/procuradorForm'
import { empresaFiles } from '../../Forms/empresaFiles'
import { AlertDialog, Crumbs, DragAndDrop, SelectEmpresa, ShowLocalFiles, StepperButtons, ReactToast } from '../../Reusable Components'

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
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center'
    },
    addButton: {
        padding: '5px 10px 5px 8px',
        height: '40px',
        margin: '5px',
        float: 'right',
        fontSize: '0.8rem'
    }
}))

export function ProcuracoesTemplate({ data, empresas, allProcuradores, selectedEmpresa, demand, handleInput, handleBlur, procuradoresEdit, addProc, addProcurador,
    removeProcurador, deleteProcuracao, handleFiles, getFile, checkExpires, setShowPendencias, removeFile, closeAlert, toast }) {

    const { dropDisplay, filteredProcuracoes, procuracao, expires, showPendencias, info, demandFiles, fileToRemove } = data
    const classes = useStyles(), { addButton, textField } = classes

    const errorHandler = (el, index) => {
        const value = procuradoresEdit[index][el.field]

        if (el.errorHandler && el.errorHandler(value)) return false
        else if (value && el.errorHandler && !el.errorHandler(value)) return true

        if (el.pattern && value) return value.match(el.pattern) === null

        if (value > el.max || value < el.min) return true
        if (value?.length < el?.minLength) return true

        else return false
    }

    const helper = (el, index) => {
        const value = procuradoresEdit[index][el.field]

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
    const { openAlertDialog, alertType } = data
    return (
        <>
            <Crumbs links={['Empresas', '/empresas']} text='Cadastro de procurações' demand={demand} />
            <div className='flex'>
                <header className='flex center' style={{ marginBottom: '10px', width: '100%' }}>
                    <SelectEmpresa
                        data={data}
                        empresas={empresas}
                        handleInput={e => handleInput(e, null)}
                        demand={demand}
                    />
                </header>
                {selectedEmpresa &&
                    <section className="paper flexColumn" style={{ position: 'relative', width: '100%' }}>
                        <div className='flexColumn' style={{ alignItems: 'center' }}>
                            <h6> Cadastrar nova procuração </h6>
                            <h4 style={{ fontWeight: 400, fontSize: '0.9em' }}> Se a procuração abranger mais de um procurador, clique em "+" para adicionar e anexe apenas 1 vez.</h4>
                        </div>
                        {procuradoresEdit.map((pr, j) =>
                            <div className="flex" key={j} >
                                {procuradorForm.map((el, i) =>
                                    <Fragment key={i * 1.31}>
                                        <TextField
                                            name={el.field}
                                            label={el.label}
                                            margin='normal'
                                            className={textField}
                                            onChange={(e) => handleInput(e, j)}
                                            onBlur={(e) => handleBlur(e, j)}
                                            type={el.type || 'text'}
                                            error={errorHandler(el, j)}
                                            helperText={helper(el, j)}
                                            select={el.select || false}
                                            value={pr[el.field] || ''}
                                            disabled={el.disabled || false}
                                            InputLabelProps={{
                                                className: textField,
                                                shrink: el.type === 'date' || undefined,
                                                style: { fontSize: '0.7rem', fontWeight: 400, color: '#888' }
                                            }}
                                            inputProps={{
                                                style: {
                                                    background: el.disabled && data.disable ? '#fff' : '#fafafa',
                                                    fontSize: '0.9rem', textAlign: 'center', color: '#000', width: el.width || 150, height: '7px'
                                                },
                                                list: el.datalist || '',
                                                maxLength: el.maxLength || '',
                                                minLength: el.minLength || '',
                                                max: el.max || '',
                                            }}
                                            multiline={el.multiline || false}
                                            minRows={el.rows || null}
                                            variant={el.variant || 'filled'}
                                            fullWidth={el.fullWidth || false}
                                        >
                                        </TextField>
                                        {j === procuradoresEdit.length - 1 && i === 3 && !demand &&
                                            <>
                                                <AddCircleOutlineSharpIcon
                                                    onClick={() => addProcurador()}
                                                    style={{
                                                        verticalAlign: 'middle',
                                                        position: 'absolute',
                                                        bottom: '112px',
                                                        right: j > 0 ? '40px' : '68px',
                                                        color: '#009688',
                                                        fontSize: 30,
                                                        cursor: 'pointer',
                                                        zIndex: 1
                                                    }}
                                                />
                                                {j > 0 && <RemoveCircleOutlineIcon
                                                    onClick={() => removeProcurador()}
                                                    style={{
                                                        verticalAlign: 'middle',
                                                        position: 'absolute',
                                                        bottom: '112px',
                                                        right: '70px',
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
                            </div>
                        )}

                        <div className="flex" style={{ alignItems: 'center', padding: '0 20px', width: '100%', margin: '12px 0 6px 0' }}>
                            <div style={{ width: '50%' }}>
                                {!demand ?
                                    <DragAndDrop
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
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '50%', paddingTop: '8px' }}>
                                <div style={{ marginTop: '12px' }}>
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
                                </div>
                                <TextField
                                    name='vencimento'
                                    label='Vencimento'
                                    margin='normal'
                                    className={textField}
                                    onChange={e => handleInput(e)}
                                    type='date'
                                    helper='se indeterminado, deixar em branco'
                                    value={data.vencimento || ''}
                                    disabled={expires === false}
                                    InputLabelProps={{
                                        className: textField,
                                        shrink: true,
                                        style: { fontSize: '0.8rem', color: '#455a64', marginBottom: '5%' }
                                    }}
                                    inputProps={{
                                        style: { background: '#fafafa', fontSize: '0.8rem', textAlign: 'center', color: '#000', height: '9px' },
                                    }}
                                    variant={'filled'}
                                />
                            </div>
                        </div>
                    </section>}
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

                <section className="flexColumn" style={{ width: '100%', paddingRight: '0' }}>
                    {
                        selectedEmpresa && !demand && (!filteredProcuracoes || !filteredProcuracoes[0]) ?
                            <div className="flex paper">
                                Nenhum procurador cadastrado para {selectedEmpresa.razaoSocial}
                            </div>
                            :
                            selectedEmpresa && filteredProcuracoes[0] &&
                            <h2 style={{ margin: '25px 0 0 15px' }}>
                                Procurações cadastradas
                            </h2>
                    }
                    {
                        filteredProcuracoes?.length > 0 && filteredProcuracoes.map((procuracao, z) =>
                            <div key={z * 0.01} className='flexColumn paper' style={{ padding: '10px 15px 20px 15px' }}>
                                <h5>
                                    Procuração {
                                        !procuracao.vencimento ?
                                            'por prazo indeterminado'
                                            :
                                            'com vencimento em ' + handleDates(procuracao.vencimento)
                                    }
                                </h5>

                                <Procurador allProcuradores={allProcuradores} procuracao={procuracao} />

                                <div className='flex center' style={{ position: 'relative' }}>
                                    <span style={divFiles}>
                                        <InsertDriveFileOutlinedIcon style={fileIcon} />
                                        <span style={{ verticalAlign: 'middle', }}>
                                            {' '} Baixar arquivo
                                        </span>
                                        <GetAppIcon style={icon} onClick={() => getFile(procuracao.procuracaoId)} />
                                    </span>
                                    <span style={{ ...divFiles, width: 90, backgroundColor: 'white', border: 0, position: 'absolute', right: 0, cursor: 'pointer' }} onClick={() => deleteProcuracao(procuracao)}>
                                        <DeleteOutlinedIcon color='secondary' style={icon} />
                                        Apagar
                                    </span>
                                </div>
                            </div>
                        )
                    }
                </section>
            </div >
            <ReactToast open={data.confirmToast} close={toast} msg={data.toastMsg} status={data.status} />
            {
                openAlertDialog &&
                <AlertDialog open={openAlertDialog} close={closeAlert} alertType={alertType} customMessage={data.customMsg} />
            }
        </>
    )
}
