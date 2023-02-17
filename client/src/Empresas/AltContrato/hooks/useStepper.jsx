//@ts-check
import { useState } from 'react'

export const useStepper = () => {
    const [activeStep, setStep] = useState(0)

    const setActiveStep = (action) => {
        setStep(prevStep => (
            action === 'next' ? prevStep + 1
                : action === 'back' ? prevStep - 1
                    : Number(action) ? action
                        : prevStep)
        )
    }
    return { activeStep, setActiveStep }
}
