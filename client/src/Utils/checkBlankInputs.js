
const checkBlankInputs = (form, state) => {

    const
        customTitle = 'Preenchimento obrigatório.'
        , blankInputs = []
    let customMsg = 'Os seguintes campos são de preenchimento obrigatório: '

    form.forEach(element => {
        const value = state[element.field]
        if (!value || value === '') {
            customMsg += `${element.label}, `
            blankInputs.push(element.field)
        }
    })
    customMsg = customMsg.substr(0, customMsg.length - 2)
    if (blankInputs.length)
        return { openAlertDialog: true, alertType: 'inputError', customMsg, customMessage: customMsg, customTitle }

    return null
}

export default checkBlankInputs
