//@ts-check
export const createAltContratoUpdate = (altContratoObj, state) => {
    const { demand, selectedEmpresa, vencimentoContrato, razaoSocial, razaoSocialEdit } = state

    const objLength = Object.keys(altContratoObj).length
    if (vencimentoContrato === selectedEmpresa.vencimentoContrato && objLength <= 2) {
        return undefined
    }

    //Mantém createdAt da demanda (log) e insere razão social, para fins de alerta de prazo(altContratoAlert).
    const { createdAt } = demand
    if (altContratoObj.numeroAlteracao && demand) {
        Object.assign(altContratoObj, { createdAt, razaoSocial: razaoSocialEdit || razaoSocial })
    }

    return altContratoObj
}
