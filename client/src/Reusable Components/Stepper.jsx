import React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

export default function CustomStepper({ activeStep, steps }) {
    return (
        <div className='paper' style={{ padding: '15px', margin: '10px 0' }} >
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    return (
                        <Step key={label}
                            {...stepProps}
                        >
                            <StepLabel {...labelProps}>
                                {label}
                            </StepLabel>
                        </Step>
                    )
                })}
            </Stepper>
        </div>
    )
}