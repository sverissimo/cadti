//@ts-check
import { useState } from 'react'

export const useStepper = () => {
    const [activeStep, setStep] = useState(0)

    const setActiveStep = (action) => {
        let updatedStep = activeStep
        if (action === 'next') updatedStep++
        if (action === 'back') updatedStep--
        if (action === 'reset') updatedStep = 0
        setStep(updatedStep)
    }
    return { activeStep, setActiveStep }
}
