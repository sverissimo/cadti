export const checkInputErrors = sendState => {

    const p = document.querySelectorAll('p')
    let label = [], errors = []
    let errString = 'Favor verificar o preenchimento dos seguintes campos: '

    if (p) {
        p.forEach(el => {
            if (el.textContent === 'Valor inválido') {
                const parent = el.parentNode
                const l = parent.querySelectorAll('label')
                label.push(l[0])
            }
        })
        if (label[0]) {
            label.forEach(l => errors.push(l.textContent))
            errors.forEach(e => errString += e + ', ')
            errString = errString
                .replace('(kg)', '')
                .replace('(cm)', '')
                .slice(0, -2) + '.'
            
            if (sendState) return { openAlertDialog: true, alertType: 'inputError', customMsg: errString }
            return errors

        } else return null
    }
}