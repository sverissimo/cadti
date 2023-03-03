//@ts-check
export const createEmpresaUpdate = (altEmpresaObj, state, demand) => {
    const { selectedEmpresa, vencimentoContrato } = state

    /**@type object */
    const empresaUpdate = Object.keys(altEmpresaObj)
        .filter(key => (altEmpresaObj[key].toString() !== '' + selectedEmpresa[key]))
        .reduce((prev, cur) => ({ ...prev, [cur]: altEmpresaObj[cur] }), {})

    if (empresaUpdate.razaoSocialEdit === selectedEmpresa.razaoSocial) {
        delete empresaUpdate.razaoSocialEdit
    }

    const updatedVencimento = vencimentoContrato
        && selectedEmpresa.vencimentoContrato !== vencimentoContrato
        ? vencimentoContrato
        : undefined

    if (Object.keys(empresaUpdate).length === 0 && !updatedVencimento) {
        return
    }

    if (!demand) {
        return empresaUpdate
    }

    const { razaoSocialEdit } = empresaUpdate
    const approvedUpdate = {
        ...empresaUpdate,
        codigoEmpresa: selectedEmpresa.codigoEmpresa,
        razaoSocial: razaoSocialEdit || undefined,
        razaoSocialEdit: undefined,
        vencimentoContrato: updatedVencimento
    }

    return approvedUpdate
}