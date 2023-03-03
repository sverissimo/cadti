//@ts-check
import humps from "humps"
import { altContratoForm, dadosEmpresaForm } from "../forms"
import { createAltContratoUpdate } from "./createAltContratoUpdate"
import { createEmpresaUpdate } from "./createEmpresaUpdate"

const forms = {
    altEmpresa: dadosEmpresaForm,
    altContrato: altContratoForm,
}

export const createUpdateObject = (type, state, demand) => {
    const altEmpresaObj = {}
    const form = forms[type]

    form.forEach(({ field }) => {
        for (const prop in state) {
            if (prop === field && state[prop]) {
                Object.assign(altEmpresaObj, { [prop]: state[prop] })
            }
        }
    })

    if (type === 'altEmpresa') {
        const altEmpresa = createEmpresaUpdate(altEmpresaObj, state, demand)
        return !demand ? altEmpresa : humps.decamelizeKeys(altEmpresa)
    }
    if (type === 'altContrato') {
        return createAltContratoUpdate(altEmpresaObj, state, demand)
    }
}
