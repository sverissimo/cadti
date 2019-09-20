import React, { Fragment } from 'react';
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
    return ['Dados do Veículo', 'Dados do seguro', 'Vistoria e laudos', 'Documentos', 'Revisão'];
}

export default function CustomStepper({ activeStep, selectedEmpresa }) {

    function getStepContent(step) {
        switch (step) {
            case 0:
                return 'Informe os dados do veículo';
            case 1:
                return <Fragment>
                    Informe os dados do seguro
                    </Fragment>
            case 2:
                return <Fragment>
                    Informações sobre vistoria e laudos
                </Fragment>
            case 3:
                return <Fragment>
                    Anexe os documentos solicitados
                </Fragment>
            case 4:
                return 'Revisão das informações e deferimento';
            default:
                return 'Selecione';
        }
    }

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