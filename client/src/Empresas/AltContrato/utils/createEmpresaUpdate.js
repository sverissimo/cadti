//@ts-check
export const createEmpresaUpdate = (altEmpresaObj, state) => {
    const { selectedEmpresa, demand } = state

    /**@type object */
    const empresaUpdate = Object.keys(altEmpresaObj)
        .filter(key => (altEmpresaObj[key].toString() !== '' + selectedEmpresa[key]))
        .reduce((prev, cur) => ({ ...prev, [cur]: altEmpresaObj[cur] }), {})

    if (empresaUpdate.razaoSocialEdit === selectedEmpresa.razaoSocial) {
        delete empresaUpdate.razaoSocialEdit
    }

    if (Object.keys(empresaUpdate).length === 0) {
        console.log("🚀 ~ file: createEmpresaUpdate.js:18 ~ createEmpresaUpdate ~ null", null)
        return null
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
    }
    return approvedUpdate
}