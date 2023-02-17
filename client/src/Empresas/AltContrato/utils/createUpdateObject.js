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
    const { codigoEmpresa } = state.selectedEmpresa
    const returnObj = { codigoEmpresa }
    const form = forms[type]

    form.forEach(({ field }) => {
        for (const prop in state) {
            if (prop === field && state[prop]) {
                Object.assign(returnObj, { [prop]: state[prop] })
            }
        }
    })

    if (Object.keys(returnObj).length <= 1) {
        return null
    }
    console.log("🚀 ~ file: createUpdateObject.js:28 ~ createUpdateObject ~ returnObj", returnObj)

    if (type === 'altEmpresa') {
        const altEmpresa = createEmpresaUpdate(returnObj, state)
        return !state.demand ? altEmpresa : humps.decamelizeKeys(altEmpresa)
    }
    if (type === 'altContrato') {
        return createAltContratoUpdate(returnObj, state)
    }
    if (type === 'socios') {
        const socioUpdates = createSociosUpdate(state)
        return !state.demand ? socioUpdates : humps.decamelizeKeys(socioUpdates)
    }
}
