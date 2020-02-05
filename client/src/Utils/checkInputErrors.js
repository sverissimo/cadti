import moment from 'moment'

export const checkInputErrors = sendState => {

    const p = document.querySelectorAll('p'),
        inputs = document.querySelectorAll('input')

    let label = [], errors = [],
        errString = 'Favor verificar o preenchimento dos seguintes campos: '

    if (p) {
        p.forEach(el => {
            if (el.textContent === 'Valor inválido') {
                const parent = el.parentNode
                const l = parent.querySelectorAll('label')
                label.push(l[0])
            }
        })
    }
    if (inputs) {
        inputs.forEach(el => {
            if (el.type === 'date') {
                if (!moment(el.value, 'YYYY-MM-DD', true).isValid()) {                    
                    const parent = el.parentNode                    
                    const l = parent.previousSibling                    
                    label.push(l)
                }
            }
        })
    }

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