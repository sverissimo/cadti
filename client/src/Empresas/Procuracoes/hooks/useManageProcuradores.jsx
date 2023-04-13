//@ts-check
import axios from 'axios'
import { useState } from 'react'
import { valueParser } from '../../../Utils'
import { procuradorForm } from '../forms/procuradorForm'

/**@returns {object} */
const createProcurador = () => procuradorForm.reduce((prev, curr) => ({ ...prev, [curr.field]: undefined }), {})

export const useManageProcuradores = () => {

    const [procuradores, setProcuradores] = useState([createProcurador()])

    const handleProcuradorChange = (event, index) => {
        const { name, value } = event.target
        const parsedValue = valueParser(name, value)
        const updatedProcuradores = [...procuradores]
        updatedProcuradores[index][name] = parsedValue
        setProcuradores(updatedProcuradores)
    }

    const addProcurador = () => {
        const updatedProcuradores = [...procuradores, createProcurador()]
        setProcuradores(updatedProcuradores)
    }

    const setProcuradoresFromDemand = (demand) => {
        const { empresaId, history } = demand
        const newProcuradores = history[0]?.newMembers || []
        const oldProcuradores = history[0]?.oldMembers || []

        newProcuradores.forEach(member => member.empresas = [empresaId])
        const parsedProcuradores = [...newProcuradores, ...oldProcuradores]
        setProcuradores(parsedProcuradores)
    }

    const removeProcurador = () => {
        const updatedProcuradores = [...procuradores]
        updatedProcuradores.pop()
        setProcuradores(updatedProcuradores)
    }

    const checkCpf = async (event, index) => {
        const updatedProcuradores = [...procuradores]
        let { value } = event.target

        if (!value) {
            delete updatedProcuradores[index].procuradorId
            setProcuradores(updatedProcuradores)
            return
        }

        const cpfAlreadyListed = procuradores.filter(p => p.cpfProcurador === value).length > 1
        if (cpfAlreadyListed) {
            alert('O cpf inserido já consta na lista de procuradores.')
            updatedProcuradores[index].cpfProcurador = ''
            delete updatedProcuradores[index].procuradorId
            setProcuradores(updatedProcuradores)
            event.target.focus()
            return
        }

        const { data: procurador } = await axios.get(`/api/procuradores/findByCpf/${value}`)
        if (!procurador) {
            delete updatedProcuradores[index].procuradorId
            setProcuradores(updatedProcuradores)
            return
        }

        if (procurador) {
            const updatedProcuradores = [...procuradores]
            updatedProcuradores[index] = procurador
            setProcuradores(updatedProcuradores)
        }

    }

    const resetProcuradoresState = () => {
        const clearedProcuradorForm = createProcurador()
        setProcuradores([clearedProcuradorForm])
    }

    return {
        procuradores,
        handleProcuradorChange,
        addProcurador,
        checkCpf,
        setProcuradoresFromDemand,
        removeProcurador,
        resetProcuradoresState
    }
}
