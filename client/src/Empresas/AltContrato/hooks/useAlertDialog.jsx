//@ts-check
import { useState } from 'react'

export const useAlertDialog = () => {
    const [alert, setAlert] = useState({})

    function createAlert(type) {
        let customTitle
        let customMessage
        switch (type) {
            case 'cpfExists':
                customTitle = 'CPF já cadastrado.'
                customMessage = `O CPF informado corresponde a um sócio já cadastrado.
                Para remover ou editar as informações dos sócios, utilize a respectiva opção abaixo.`
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
        setAlert({ ...alert, openAlertDialog: false })
    }

    return { alert, createAlert, closeAlert }
}
