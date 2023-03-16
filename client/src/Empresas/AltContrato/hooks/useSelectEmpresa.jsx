//@ts-check
import { useCallback } from 'react'
import { useState, useEffect, useRef } from 'react'
import { toInputDate } from '../../../Utils/formatValues'

export const useSelectEmpresa = (empresas, demand) => {
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
        const empresa = empresas.find(e => e.razaoSocial === inputValue)
        if (empresa) {
            const selectedEmpresa = { ...empresa }
            prevSelectedEmpresa.current = selectedEmpresa
            selectedEmpresa.vencimentoContrato = toInputDate(selectedEmpresa.vencimentoContrato)
            setSelectedEmpresa(selectedEmpresa)
            return selectedEmpresa
        }

        if (prevSelectedEmpresa.current) {
            unselectEmpresa()
        }
    }

    const setEmpresaFromDemand = useCallback(() => {
        const { altEmpresa } = demand?.history[0] || {}
        const alteredFields = Object.keys(altEmpresa)
        const selectedEmpresa = { ...empresas.find(e => e.codigoEmpresa === demand.empresaId) }
        selectedEmpresa.vencimentoContrato = toInputDate(selectedEmpresa.vencimentoContrato)

        const updatedEmpresa = { ...selectedEmpresa, ...altEmpresa }
        setSelectedEmpresa(selectedEmpresa)
        return { selectedEmpresa, alteredFields, updatedEmpresa }
    }, [demand?.empresaId, demand?.history, empresas])

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
        setEmpresaFromDemand,
        unselectEmpresa,
        prevSelectedEmpresa: prevSelectedEmpresa?.current
    }
}
