
const checkBlankInputs = (form, component) => {
    const
        { state, setState } = component
        , blankFields = []

    form.forEach(element => {
        const value = state[element.field]
        if (!value || value === '')
            blankFields.push(element.field)
        //return { openAlertDialog: true, alertType: 'inputError', customMsg: errString, errors }
    })

    //setState({ openAlertDialog: true, alertType: 'inputError', customMsg: errString, errors })

    return blankFields
}

export default checkBlankInputs
