//@ts-check
import { useState, useEffect, useRef } from 'react'
import { toInputDate } from '../../../Utils/formatValues'

export const useSelectEmpresa = (empresas) => {
    /**@type object */
    const [selectedEmpresa, setSelectedEmpresa] = useState()
    const prevSelectedEmpresa = useRef(selectedEmpresa)

    useEffect(() => {
        if (empresas?.length === 1 && !selectedEmpresa) {
            const selectedEmpresa = { ...empresas[0] }
            selectedEmpresa.vencimentoContrato = toInputDate(selectedEmpresa.vencimentoContrato)
            setSelectedEmpresa({ selectedEmpresa, razaoSocialEdit: selectedEmpresa.razaoSocial })
        }
    }, [empresas, selectedEmpresa])

    function selectEmpresa(inputValue) {
        const selectedEmpresa = empresas.find(e => e.razaoSocial === inputValue)
        if (selectedEmpresa) {
            selectedEmpresa.vencimentoContrato = toInputDate(selectedEmpresa.vencimentoContrato)
            setSelectedEmpresa(selectedEmpresa)
            return selectedEmpresa
        }
    }

    function unselectEmpresa() {
        if (prevSelectedEmpresa.current) {
            const clearEmpresaFields = Object.keys(prevSelectedEmpresa.current)
                .reduce((prev, cur) => ({ ...prev, [cur]: undefined }), {})
            setSelectedEmpresa(undefined)
            return clearEmpresaFields
        }
    }

    return { selectedEmpresa, selectEmpresa, unselectEmpresa }
}
