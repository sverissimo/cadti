//@ts-check
import { altContratoForm, dadosEmpresaForm, sociosForm } from "../forms"
import { createAltEmpresaObject } from "./createAltEmpresaObject"

const forms = {
    altEmpresa: dadosEmpresaForm,
    altContrato: altContratoForm,
    socios: sociosForm
}
export const createRequestObject = (type, state) => {
    /*
    const { selectedEmpresa, demand, razaoSocialEdit } = state
    const { codigoEmpresa, razaoSocial } = selectedEmpresa
    const createdAt = demand && demand.createdAt
    */
    const { codigoEmpresa } = state.selectedEmpresa
    const returnObj = { codigoEmpresa }

    const form = forms[type]
    form.forEach(({ field }) => {
        for (let prop in state) {
            if (prop === field && state[prop]) {
                Object.assign(returnObj, { [prop]: state[prop] })
            }
        }
    })
    if (type === 'altEmpresa') {
        return createAltEmpresaObject(returnObj, state)
    }
    /*  if (Object.keys(returnObj).length <= 1) {
         return null
     }

     //obj altContrato: Mantém createdAt da demanda (log) e insere razão social, para fins de alerta de prazo(altContratoAlert).
     if (returnObj.numeroAlteracao && demand) {
         Object.assign(returnObj, { createdAt, razaoSocial: razaoSocialEdit || razaoSocial })
     }

     return returnObj */
}
