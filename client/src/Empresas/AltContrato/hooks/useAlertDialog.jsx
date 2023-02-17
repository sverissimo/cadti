//@ts-check
import { useState } from 'react'
const alertTypes = {
    DUPLICATE_CPF: 'duplicateCpf',
    OVERSHARED: 'overShared',
    FIELDS_MISSING: 'fieldsMissing',
}

export const useAlertDialog = () => {
    const [alertObj, setAlert] = useState({})

    function createAlert(type) {
        let customTitle
        let customMessage
        switch (type) {
            case 'duplicateCpf':
                customTitle = 'CPF já cadastrado.'
                customMessage = `O CPF informado corresponde a um sócio já listado.
                Para remover ou editar informações dos sócios listados, utilize as opções disponíveis à direita da lista de sócios.`
                break
            case 'overShared':
                customTitle = 'Participação societária inválida.'
                customMessage = 'A participação societária informada excede a 100%.'
                break
            case 'fieldsMissing':
                customTitle = 'Favor preencher todos os campos.'
                customMessage = 'Os campos acima são de preenchimento obrigatório. Certifique-se de ter preenchido todos eles.'
                break
            default:
        }

        const alertContent = { customTitle, customMessage }
        setAlert({ ...alertContent, openAlertDialog: true })
    }

    function closeAlert() {
        setAlert({ openAlertDialog: false })
    }

    return { alertObj, alertTypes, createAlert, closeAlert }
}
