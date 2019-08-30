import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        marginTop: '1%',        
    },
    button: {
        marginRight: theme.spacing(1),
    },
    instructions: {
        marginTop: theme.spacing(1),        
        padding: '1% 0 0 3%',
        fontWeight: 500
    },
}));

function getSteps() {
    return ['Dados do Veículo', 'Vistorias, seguros e documentos', 'Revisão'];
}

function getStepContent(step) {
    switch (step) {
        case 0:
            return 'Informe os dados do veículo';
        case 1:
            return 'Informar dados da vistoria/seguro e anexar documentos';
        case 2:
            return 'Revisão das informações e deferimento';
        default:
            return 'Selecione';
    }
}

export default function CustomStepper({ activeStep, setActiveStep }) {
    const classes = useStyles()    
    const steps = getSteps()

    return (
        <div className={classes.root}>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    )
                })}
            </Stepper>
            <div>
                {activeStep === steps.length ? (
                    <div>
                        <Typography className={classes.instructions}>
                            All steps completed - you&apos;re finished
                        </Typography>
                       
                    </div>
                ) : (
                        <div>
                            <Typography className={classes.instructions}>{getStepContent(activeStep)}</Typography>                            
                        </div>
                    )}
            </div>
        </div>
    )
}