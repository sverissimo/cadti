import React, { Fragment } from 'react'

import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import FormSubtiltle from '../Reusable Components/FormSubtiltle'
import ShowLocalFiles from '../Reusable Components/ShowLocalFiles';
import StepperButtons from '../Reusable Components/StepperButtons';

import Button from '@material-ui/core/Button'
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import { sociosForm } from '../Forms/sociosForm'
import { empresaFiles } from '../Forms/empresaFiles';
import TextInput from '../Reusable Components/TextInput'
import DragAndDrop from '../Reusable Components/DragAndDrop'
import SaveIcon from '@material-ui/icons/Save'
import { errorHandler, helper } from '../Utils/checkInputErrors';

const useStyles = makeStyles(theme => ({
    list: {
        margin: theme.spacing(1),
        width: 180,
        fontSize: '0.7rem',
        fontColor: '#999',
        textAlign: 'center',
    },
    iconButton: {
        marginTop: '17px',
        padding: '6px 0px'
    }
}))

export default function ({ socios, empresas, handleInput, handleBlur, data, addSocio, enableEdit, handleEdit, removeSocio,
    handleFiles, removeFile, handleSubmit, setShowPendencias }) {

    const
        { activeStep, stepTitles, filteredSocios, contratoSocial, selectedEmpresa, dropDisplay, fileToRemove, demand, demandFiles, showPendencias, info } = data,
        classes = useStyles(), { iconButton, list } = classes,
        contratoSocialForm = [empresaFiles[0]]

    let standAlone = true
    if (stepTitles) standAlone = false

    return (
        <>
            <main className="flex center">
                {
                    standAlone &&
                    <SelectEmpresa
                        data={data}
                        empresas={empresas}
                        handleInput={handleInput}
                        handleBlur={handleBlur}
                    />
                }
                {
                    (selectedEmpresa || !standAlone) &&
                    <section className="flex center paper">
                        {
                            standAlone ?
                                <div className="flexColumn" style={{ alignItems: 'center' }}>
                                    <h6 style={{ fontSize: '14px' }}>Alteração do quadro Societário</h6>
                                    <p style={{ fontSize: '12px', color: '#555' }}> Para adicionar um novo sócio, preencha os campos abaixo e clique em "Adicionar sócio".</p>
                                </div>

                                :
                                <FormSubtiltle subtitle={stepTitles[activeStep]} />
                        }

                        <div className='flex center' style={{ padding: '10px 0', width: '100%' }}>
                            <TextInput
                                form={sociosForm}
                                data={data}
                                handleBlur={handleBlur}
                                handleInput={handleInput}
                            />
                        </div>
                        <div style={{ margin: '5px 0 7px 84.58%', width: '100%' }}>
                            <Button color='primary' variant='outlined' size='small' onClick={addSocio}>
                                <AddIcon /> Adicionar sócio
                    </Button>
                        </div>
                    </section>
                }
            </main>
            {
                selectedEmpresa && filteredSocios.length === 0 &&
                <section>
                    <p>
                        Nenhum sócio cadastrado para {selectedEmpresa.razaoSocial}
                    </p>
                </section>
            }
            {
                socios?.length > 0 &&
                <>
                    <section className="flex center paper">
                        <p > Sócios cadastrados</p>
                        {socios.map((s, i) =>
                            <div key={i}>
                                {sociosForm.map((e, k) =>
                                    <Fragment key={k + 1000}>
                                        <TextField
                                            value={s[e.field] || ''}
                                            name={e.field}
                                            label={e.label}
                                            className={list}
                                            disabled={s.edit ? false : true}
                                            onChange={handleEdit}
                                            error={s.edit ? errorHandler(s[e.field], e) : null}
                                            helperText={s.edit ? helper(s[e.field], e) : null}
                                            type={e?.type}
                                            InputLabelProps={
                                                {
                                                    shrink: true,
                                                    style: {
                                                        fontWeight: 600,
                                                        fontFamily: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif',
                                                        color: '#888'
                                                    }
                                                }}
                                            inputProps={{
                                                style: {
                                                    fontSize: '13px',
                                                    color: s.edit === true ? '#000'
                                                        : s.status === 'new' ? 'green'
                                                            : s.status === 'modified' ? '#FF2500'
                                                                : s.status === 'deleted' ? 'red'
                                                                    : '#888',
                                                    textDecoration: s.status === 'deleted' && !s.edit ? 'line-through' : ''
                                                }
                                            }}
                                        />
                                    </Fragment>
                                )}
                                <Button component='span' className={iconButton} title='editar' onClick={() => enableEdit(i)}>
                                    <EditIcon />
                                </Button>

                                <Button className={iconButton}
                                    color={s.status === 'deleted' ? 'primary' : 'secondary'}
                                    title={s.status === 'deleted' ? 'Desfazer exclusão' : 'Remover'}
                                    onClick={() => removeSocio(i)}>
                                    {s.status === 'deleted' ? <i className='material-icons'>undo</i> : <DeleteIcon />}
                                </Button>
                            </div>
                        )}
                    </section>
                    {
                        standAlone && demand ?
                            <section>
                                {contratoSocial &&
                                    <ShowLocalFiles
                                        demand={demand}
                                        collection='empresaDocs'
                                        demandFiles={[contratoSocial]}
                                        form={contratoSocialForm}
                                    />
                                }
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
                            </section>
                            :
                            standAlone
                                ?
                                <section>
                                    {!demand &&
                                        <div className='flex center'>
                                            <DragAndDrop
                                                name='contratoSocial'
                                                formData={contratoSocial}
                                                dropDisplay={dropDisplay}
                                                handleFiles={handleFiles}
                                                demandFiles={demandFiles}
                                                removeFile={removeFile}
                                                fileToRemove={fileToRemove}
                                                style={{ width: '40%' }}
                                            />
                                        </div>}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="contained"
                                            style={{ margin: '0px 0 10px 0' }}
                                            onClick={() => handleSubmit()}
                                        >
                                            Enviar <span>&nbsp;&nbsp; </span> <SaveIcon />
                                        </Button>
                                    </div>
                                </section>
                                :
                                null
                    }
                </>
            }
        </>
    )
}