//@ts-check
import { useCallback } from 'react'
import { useState } from 'react'

export const useStepper = () => {
    const [activeStep, setStep] = useState(0)

    const setActiveStep = useCallback((action) => {
        setStep(prevStep => (
            action === 'next' ? prevStep + 1
                : action === 'back' ? prevStep - 1
                    : Number(action) || action === 0 ? action
                        : prevStep)
        )
    }, [])
    return { activeStep, setActiveStep }
}
