//@ts-check
import humps from "humps"
import { altContratoForm, dadosEmpresaForm } from "../forms"
import { createAltContratoUpdate } from "./createAltContratoUpdate"
import { createEmpresaUpdate } from "./createEmpresaUpdate"
import { createSociosUpdate } from "./createSociosUpdate"

const forms = {
    altEmpresa: dadosEmpresaForm,
    altContrato: altContratoForm,
    socios: []
}

export const createUpdateObject = (type, state) => {
    const altEmpresaObj = {}
    const form = forms[type]

    form.forEach(({ field }) => {
        for (const prop in state) {
            if (prop === field && state[prop]) {
                Object.assign(altEmpresaObj, { [prop]: state[prop] })
            }
        }
    })

    if (type !== 'socios' && Object.keys(altEmpresaObj).length === 0) {
        return null
    }

    if (type === 'altEmpresa') {
        const altEmpresa = createEmpresaUpdate(altEmpresaObj, state)
        return !state.demand ? altEmpresa : humps.decamelizeKeys(altEmpresa)
    }
    if (type === 'altContrato') {
        return createAltContratoUpdate(altEmpresaObj, state)
    }
    if (type === 'socios') {
        return createSociosUpdate(state)
    }
}
