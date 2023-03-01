//@ts-check
import axios from 'axios'
import { useCallback } from 'react'
import { useState } from 'react'
import valueParser from '../../../Utils/valueParser'
import { sociosForm } from '../forms'

export const useManageSocios = (socios) => {
    /**@type any[] */
    const [filteredSocios, setSocios] = useState()
    const clearedForm = {}

    sociosForm.forEach(obj => clearedForm[obj.field] = '')

    const filterSocios = useCallback((selectedEmpresa) => {
        if (!selectedEmpresa) {
            return
        }

        const { codigoEmpresa } = selectedEmpresa
        const filteredSocios = socios
            .filter(s => s.empresas.some(e => e.codigoEmpresa === selectedEmpresa.codigoEmpresa))
            .map(s => {
                const { share } = s.empresas.find(e => e.codigoEmpresa === codigoEmpresa)
                return { ...s, share }
            })
        setSocios(filteredSocios)
        return filteredSocios
    }, [socios])

    const addNewSocio = async (state) => {
        const socios = [...filteredSocios]
        const addedSocio = { status: 'new' }

        sociosForm.forEach(({ field }) => {
            Object.assign(addedSocio, { [field]: state[field] })
        })

        const { data: existingSocio } = await axios.post('/api/checkSocios', { newCpfs: [addedSocio?.cpfSocio] })

        if (existingSocio && !Array.isArray(existingSocio)) {
            const { socio_id: socioId, empresas } = existingSocio
            const update = {
                socioId,
                empresas,
                status: 'modified',
                outsider: true,
            }
            Object.assign(addedSocio, { ...update })
        }

        addedSocio.share = Number(addedSocio?.share) || 0
        socios.push(addedSocio)
        socios.sort((a, b) => a.nomeSocio.localeCompare(b.nomeSocio))

        setSocios(socios)
    }

    const enableEdit = (index) => {
        const socio = filteredSocios[index]

        socio.edit = !socio.edit
        const editedSocios = filteredSocios.map((s, i) => (
            i !== index ? { ...s, edit: false } : s)
        )
        setSocios(editedSocios)
    }

    const handleEdit = e => {
        const { name } = e.target
        let { value } = e.target

        if (name === 'share') {
            value = value.replace(',', '.')
        }

        const fs = [...filteredSocios]
        const editSocio = fs.find(s => s.edit === true)
        if (!editSocio) {
            return
        }

        const parsedValue = valueParser(name, value)
        editSocio[name] = parsedValue

        if (!editSocio.status) {
            editSocio.status = 'modified'
        }
        editSocio.share = name === 'share' && +value
        //const errors = checkForErrors() || {}
        setSocios(fs)
    }

    const updateSocios = useCallback((selectedEmpresa, demand) => {
        const { socioUpdates } = demand?.history[0]
        const filteredSocios = filterSocios(selectedEmpresa)

        if (!socioUpdates || !socioUpdates.length) {
            setSocios(filteredSocios)
        }

        const newSocios = socioUpdates.filter(s => s.status === 'new' || s.outsider)
        const updatedSocios = filteredSocios.map(socio => {
            const updatedSocio = socioUpdates.find(({ socioId }) => socioId === socio.socioId) || {}
            return { ...socio, ...updatedSocio }
        })
            .concat(newSocios)
            .sort((a, b) => a.nomeSocio.localeCompare(b.nomeSocio))

        setSocios(updatedSocios)
    }, [filterSocios])


    const removeSocio = index => {
        const updatedSocios = [...filteredSocios]
        const socioToRemove = updatedSocios[index]
        if (socioToRemove?.status === 'new' || (socioToRemove.outsider)) {
            updatedSocios.splice(index, 1)
            setSocios(updatedSocios)
            return
        }

        if (socioToRemove?.status !== 'deleted') {
            socioToRemove.originalStatus = socioToRemove.status
            socioToRemove.status = 'deleted'
        } else {
            socioToRemove.status = socioToRemove?.originalStatus
        }

        setSocios(updatedSocios)
    }

    return {
        filteredSocios,
        filterSocios,
        setSocios,
        addNewSocio,
        enableEdit,
        handleEdit,
        updateSocios,
        removeSocio,
        clearedForm,
    }
}
