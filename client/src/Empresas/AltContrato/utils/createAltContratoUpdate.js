//@ts-check
export const createAltContratoUpdate = (altContratoObj, state) => {
    const { demand, selectedEmpresa, razaoSocial, razaoSocialEdit } = state

    if (altContratoObj.vencimentoContrato === selectedEmpresa.vencimentoContrato) {
        delete altContratoObj.vencimentoContrato
    }

    if (Object.keys(altContratoObj).length === 0) {
        console.log("🚀 ~ file: createAltContratoUpdate.js:13 ~ createAltContratoUpdate ~ null", null)
        return null
    }

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
