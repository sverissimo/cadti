//@ts-check
import { useCallback } from 'react'
import { altContratoForm, dadosEmpresaForm } from '../forms'

const forms = [dadosEmpresaForm, altContratoForm]

export const useInputErrorHandler = () => {

    const checkDuplicate = useCallback((cpfSocio, filteredSocios) => {
        const duplicateCpf = filteredSocios.some(s => !!cpfSocio && (s.cpfSocio === cpfSocio))
        return duplicateCpf
    }, [])

    const checkBlankInputs = useCallback((activeStep, state) => {
        if (forms.length <= activeStep) {
            return false
        }
        const form = [...forms[activeStep]]
        //@ts-ignore
        const blankInputs = form.filter(form => form.required !== false)
            .some(({ field }) => !state[field])
        return blankInputs
    }, [])

    return { checkDuplicate, checkBlankInputs }
}
