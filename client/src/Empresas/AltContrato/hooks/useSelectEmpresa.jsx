//@ts-check
import { useState, useEffect, useRef } from 'react'
import { toInputDate } from '../../../Utils/formatValues'

export const useSelectEmpresa = (empresas) => {
    /**@type object */
    const [selectedEmpresa, setSelectedEmpresa] = useState()
    const prevSelectedEmpresa = useRef()

    useEffect(() => {
        if (empresas?.length === 1 && !selectedEmpresa) {
            const selectedEmpresa = { ...empresas[0] }
            selectedEmpresa.vencimentoContrato = toInputDate(selectedEmpresa.vencimentoContrato)
            setSelectedEmpresa(selectedEmpresa)
        }
    }, [empresas, selectedEmpresa])

    function selectEmpresa(inputValue) {
        const selectedEmpresa = empresas.find(e => e.razaoSocial === inputValue)
        if (selectedEmpresa) {
            prevSelectedEmpresa.current = selectedEmpresa
            selectedEmpresa.vencimentoContrato = toInputDate(selectedEmpresa.vencimentoContrato)
            setSelectedEmpresa(selectedEmpresa)
            return selectedEmpresa
        }

        if (prevSelectedEmpresa.current) {
            unselectEmpresa()
        }
    }

    function unselectEmpresa() {
        //@ts-ignore
        const clearEmpresaFields = Object.keys(prevSelectedEmpresa.current)
            .reduce((prev, cur) => ({ ...prev, [cur]: undefined }), {})
        setSelectedEmpresa(undefined)
        return clearEmpresaFields
    }

    return {
        selectedEmpresa,
        selectEmpresa,
        unselectEmpresa,
        prevSelectedEmpresa: prevSelectedEmpresa?.current
    }
}
