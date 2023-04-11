//@ts-check
import { useEffect, useState } from 'react'
import { valueParser } from '../../../Utils'
import { procuradorForm } from '../forms/procuradorForm'

const createProcurador = () => procuradorForm.reduce((prev, curr) => ({ ...prev, [curr.field]: '' }), {})


export const useManageProcuradores = () => {

    const [procuradores, setProcuradores] = useState([createProcurador()])

    const setIndexedProcuradores = (procuradores) => {
        const indexedProcuradores = procuradores.map((p, i) => {
            const updatedProc = {}
            for (const key in p) {
                updatedProc[key + i] = p[key]
            }
            return updatedProc
        })
        return indexedProcuradores.sort((a, b) => a.nomeProcurador > b.nomeProcurador)
    }

    const handleProcuradorChange = (event, index) => {
        const { name, value } = event.target
        const parsedValue = valueParser(name, value)
        const f = [...procuradores]
        f[index][name] = parsedValue
        setProcuradores(f)
    }

    const addProcurador = () => {
        const updatedProcuradores = [...procuradores, createProcurador()]
        setProcuradores(updatedProcuradores)
    }

    const removeProcurador = () => {
        const updatedProcuradores = [...procuradores]
        updatedProcuradores.pop()
        setProcuradores(updatedProcuradores)
    }

    const _checkCpf = (name, value) => {
        /*  if (name.match('cpfProcurador')) {
             const proc = procuradores.find(p => p.cpfProcurador === value)
             if (proc) {
                 const index = name.charAt(name.length - 1)
                 let cpfExists
                 Object.keys(state).forEach(stateKey => {
                     if (stateKey !== name && state[stateKey] === value) {
                         alert('Este CPF já foi informado.')
                         setState({ ...state, [name]: '' })
                         cpfExists = true
                     }
                 })

                 if (!cpfExists)
                     procuradorForm.forEach(({ field }) => {
                         const key = field + index
                         setState({ ...state, [key]: proc[field] })
                     })
             }
         }  */
    }

    return { procuradores, setProcuradores, handleProcuradorChange, addProcurador, removeProcurador }
}




