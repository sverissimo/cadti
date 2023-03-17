//@ts-check
import humps from "humps"
import { altContratoForm, dadosEmpresaForm } from "../forms"
import { createAltContratoUpdate } from "./createAltContratoUpdate"
import { createEmpresaUpdate } from "./createEmpresaUpdate"

const forms = {
    altEmpresa: dadosEmpresaForm,
    altContrato: altContratoForm,
}

export const createUpdateObject = (type, data, demand) => {
    const altEmpresaObj = {}
    const form = forms[type]

    form.forEach(({ field }) => {
        for (const prop in data) {
            if (prop === field && data[prop]) {
                Object.assign(altEmpresaObj, { [prop]: data[prop] })
            }
        }
    })

    if (type === 'altEmpresa') {
        const altEmpresa = createEmpresaUpdate(altEmpresaObj, data, demand)
        return !demand ? altEmpresa : humps.decamelizeKeys(altEmpresa)
    }
    if (type === 'altContrato') {
        return createAltContratoUpdate(altEmpresaObj, data, demand)
    }
}
