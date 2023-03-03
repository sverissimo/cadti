//@ts-check
export const createAltContratoUpdate = (altContratoObj, state, demand) => {
    const { selectedEmpresa, razaoSocial, razaoSocialEdit } = state
    const propsCount = Object.keys(altContratoObj).length

    if (propsCount === 0 || (propsCount === 1 && !!altContratoObj.vencimentoContrato)) {
        return
    }
    console.log("🚀 ~ file: createAltContratoUpdate.js:5 ~ createAltContratoUpdate ~ altContratoObj:", altContratoObj)

    //Mantém createdAt da demanda (log) e insere razão social, para fins de alerta de prazo(altContratoAlert).
    if (altContratoObj.numeroAlteracao && demand) {
        const { createdAt } = demand
        Object.assign(altContratoObj, {
            createdAt,
            codigoEmpresa: selectedEmpresa.codigoEmpresa,
            razaoSocial: razaoSocialEdit || razaoSocial
        })
    }

    return altContratoObj
}
