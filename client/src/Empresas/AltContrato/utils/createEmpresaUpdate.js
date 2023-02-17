//@ts-check
export const createEmpresaUpdate = (altEmpresaObj, state) => {
    const { selectedEmpresa, demand } = state

    /**@type object */
    const empresaUpdate = Object.keys(altEmpresaObj)
        .filter(key => (altEmpresaObj[key] !== selectedEmpresa[key]))
        .reduce((prev, cur) => ({ ...prev, [cur]: altEmpresaObj[cur] }), {})

    const { razaoSocialEdit } = empresaUpdate

    if (razaoSocialEdit === selectedEmpresa.razaoSocial) {
        delete empresaUpdate.razaoSocialEdit
    }

    if (demand) {
        empresaUpdate.codigoEmpresa = selectedEmpresa.codigoEmpresa
        empresaUpdate.razaoSocial = razaoSocialEdit ? razaoSocialEdit : undefined
        delete empresaUpdate.razaoSocialEdit
    }

    return empresaUpdate
}

/*
Official docs states:

> It is unsafe to chain further commands that rely on the subject after .clear().

So, a simple alternative woldu be something like:

    cy.get('#my-input-element').clear()
    cy.get('#my-input-element').type('some-input')

More about clear command:

https://docs.cypress.io/api/commands/clear
*/