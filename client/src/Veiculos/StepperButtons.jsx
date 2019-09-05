import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'

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
    }
}))

export default function StepperButtons({activeStep, setActiveStep, handleCadastro}) {
const classes = useStyles(), {backButton, button} = classes
    return (
        <div>
            <Button
                variant="contained"
                className={backButton}
                onClick={() => setActiveStep('back')}
                disabled={activeStep === 0}
            >
                Voltar
            </Button>
            {activeStep <= 3 ?
                <Button
                    variant="contained"
                    color="primary"
                    className={button}
                    onClick={() => setActiveStep('next')}
                >
                    Avançar
                </Button>
                :
                <Button
                    variant="contained"
                    color="primary"
                    className={button}
                    onClick={handleCadastro()}
                >
                    Concluir
            </Button>}
        </div>
    )
}
