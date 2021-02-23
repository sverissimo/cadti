import { eForm, sForm, segForm, vForm } from '../Forms/joinForms'

import { cadForm } from '../Forms/cadForm'
import { empresasForm } from '../Forms/empresasForm'
import { sociosForm } from '../Forms/sociosForm'
import { procuradorForm } from '../Forms/procuradorForm'
import { seguroForm } from '../Forms/seguroForm'

//Essa função seleciona e formata todos os campos que aparecem no componente ShowDetails e na exportação do arquivo de excel no ConsultasContainer
const dataToReturn = (tab, data) => {
    if (data) {
        delete data.tableData
        const
            element = [],
            formPattern = setForm(tab)

        Object.keys(data).forEach(key => {
            if (tab === 3) {
                const { veiculoId, laudoId, tableData, modeloChassiId, modeloCarroceriaId, codigoEmpresa, vencimentoContrato, delegatarioCompartilhado,
                    acessibilidadeId, equipamentosId, compartilhadoId, ...vData } = data
                data = vData
            }

            formPattern.forEach(({ field, label, type, width, fullWidth }) => {
                if (key === field) {
                    let obj = {}
                    Object.assign(obj, { field, label, value: data[key] })
                    if (type) Object.assign(obj, { type })
                    if (width) Object.assign(obj, { width })
                    element.push(obj)
                    obj = {}
                }
            })
        })

        Object.keys(data).forEach(key => {

            const equal = element.find(el => el.field === key)

            if (!equal && tab === 3)
                element.push({ field: key, label: key, value: data[key] })
        })
        return element
    }
}

export default dataToReturn

//Essa função adiciona novos campos e sobrescreve configurações de design dos formulários utilizados em outras partes do sistema.
function mergeForms(form, jForm) {
    let
        updatedForm = [],
        updatedObj,
        joinForm = [...jForm]

    form.forEach(f => {
        joinForm.forEach((jf, i) => {
            if (f.field === jf.field) {
                updatedObj = Object.assign({}, f, jf)
                joinForm.splice(i, 1)
                updatedForm.push(updatedObj)
            }
            else if (!updatedForm.find(el => el.field === f.field)) {
                updatedForm.push(f)
            }
        })
    })

    updatedForm = updatedForm.concat(joinForm)

    return updatedForm
}
//Junta os forms que aparecem apenas na tabela do ConsultaTemplate com outros campos do DB (próprios da tabela ou joins)
export function setForm(tab) {
    let formPattern
    switch (tab) {
        case 0:
            formPattern = mergeForms(empresasForm, eForm)
            break
        case 1:
            formPattern = sociosForm.concat(sForm)
            break
        case 2:
            formPattern = procuradorForm
            break
        case 3:
            let consolidateForm = []
            cadForm.forEach(form => {
                consolidateForm.push(...form)
            })
            formPattern = consolidateForm.concat(...vForm)
            return formPattern
        case 4:
            formPattern = seguroForm.concat(segForm)
            break
        default:
            return formPattern
    }
}
