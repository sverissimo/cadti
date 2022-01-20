import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'


const useStyles = makeStyles(theme => ({

    button: {
        margin: theme.spacing(1),
        float: 'right'
    },
    backButton: {
        margin: theme.spacing(1),
        float: 'left',
        color: '#333',
        backgroundColor: '#eee'
    },
    textField: {
        marginTop: '20px',
        width: '100%'
    }
}))

export default function StepperButtons({ activeStep, setActiveStep, lastStep, handleSubmit, disabled, demand, uniqueStep, declineButtonLabel,
    setShowPendencias, showPendencias, handleInput, info, obs, addObs, buttonLabel }) {

    const classes = useStyles(), { backButton, button, textField } = classes

    let role
    if (demand?.status.match('Pendências')) role = 'empresa'
    if (demand?.status.match('Aguardando')) role = 'seinfra'

    useEffect(() => {
        function nextShortcut(e) {
            if (e.keyCode === 37 && e.ctrlKey && activeStep !== 0)
                setActiveStep('back')
            if (e.keyCode === 39 && e.ctrlKey && activeStep !== lastStep)
                setActiveStep('next')
            if (e.keyCode === 13 && e.ctrlKey)
                handleSubmit()
        }
        document.addEventListener('keydown', nextShortcut)
        return () => document.removeEventListener('keydown', nextShortcut)
    })

    return (
        <div style={{ width: '100%' }}>
            {activeStep < lastStep ?
                <>
                    <Button
                        variant="contained"
                        className={backButton}
                        title={activeStep !== 0 ? 'Ctrl + ←' : null}
                        onClick={() => setActiveStep('back')}
                        disabled={activeStep === 0}
                    >
                        Voltar
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        title={!disabled ? 'Ctrl + →' : null}
                        className={button}
                        onClick={() => setActiveStep('next')}
                        disabled={disabled}
                    >
                        Avançar
                    </Button>
                </>
                :
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {role === 'seinfra' && !showPendencias && !addObs
                        ?
                        null
                        :
                        <TextField
                            name={addObs ? 'obs' : 'info'}  //Se estiver na solicitação, info>>demand, se na aprovação, veiculo>>obs
                            className={textField}
                            value={addObs ? obs : info}
                            label={
                                !demand || role === 'empresa' ? 'Observações/informações complementares'
                                    :
                                    demand && uniqueStep ? 'Motivos para o indeferimento'
                                        :
                                        showPendencias ? 'Pendências/irregularidades para a aprovação'
                                            :
                                            'Observações'
                            }
                            type='text'
                            onChange={handleInput}
                            InputLabelProps={{ shrink: true, style: { fontWeight: 600, marginBottom: '5%' } }}
                            inputProps={{ style: { paddingBottom: '2%' }, maxLength: 600 }}
                            multiline
                            rows={3}
                            variant='outlined'
                        />
                    }
                    <div style={{ display: 'flex', width: '100%' }}>
                        {activeStep === lastStep && !uniqueStep &&
                            <Button
                                variant="contained"
                                className={backButton}
                                title={activeStep !== 0 ? 'Ctrl + ←' : null}
                                onClick={() => setActiveStep('back')}
                                disabled={activeStep === 0}
                            >
                                Voltar
                            </Button>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                            {
                                !demand || role === 'empresa' ?
                                    <Button
                                        variant='contained'
                                        color="primary"
                                        className={button}
                                        onClick={() => handleSubmit()}
                                    >
                                        {buttonLabel || 'Enviar solicitação'}
                                    </Button>
                                    :
                                    <>
                                        <Button
                                            variant='outlined'
                                            color="secondary"
                                            className={button}
                                            onClick={() => setShowPendencias()}
                                        >
                                            {showPendencias ? 'Cancelar' : declineButtonLabel || 'Registrar pendencias'}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color={showPendencias ? "secondary" : "primary"}
                                            className={button}
                                            onClick={() => showPendencias ? handleSubmit(false) : handleSubmit(true)}
                                        >
                                            {showPendencias ? 'Indeferir' : 'Aprovar'}
                                        </Button>
                                    </>
                            }
                        </div>
                    </div>

                </div>
            }
        </div>
    )
}
