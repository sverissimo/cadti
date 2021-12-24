import moment from 'moment'

export const checkInputErrors = (sendState, dontSetDate) => {

    const
        p = document.querySelectorAll('p'),
        inputs = document.querySelectorAll('input')

    let
        label = [],
        errors = [],
        errString = 'Favor verificar o preenchimento dos seguintes campos: '

    if (p) {
        p.forEach(el => {
            if (el.textContent === 'Valor inválido' || el.textContent === '✘') {
                const parent = el.parentNode
                const l = parent.querySelectorAll('label')
                label.push(l[0])
            }
        })
    }
    if (inputs && !dontSetDate) {
        inputs.forEach(el => {
            if (el.type === 'date' && el.name !== 'dataJunta') {
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

        if (sendState)
            return {
                openAlertDialog: true, alertType: 'inputError',
                customTitle: 'Preenchimento Inválido,',
                customMsg: errString, customMessage: errString, errors
            }
        return errors
    } else return null
}

export const errorHandler = (value, el) => {
    if (!value) return

    if (el.errorHandler && el.errorHandler(value)) return false
    else if (value && el.errorHandler && !el.errorHandler(value)) return true

    if (value?.length < el?.minLength) return true

    if (el.type === 'number') {
        if (value > el.max || value < el.min) return true
        else return false
    }

    if (typeof value !== 'string') value = value.toString()
    if (el.pattern) return value.match(el.pattern) === null
    else return false
}

export const helper = (value, el) => {
    if (!value) return

    if (el.errorHandler && el.errorHandler(value)) return '✓'
    else if (value && el.errorHandler && !el.errorHandler(value)) return '✘'

    if (value?.length < el?.minLength) return '✘'
    if (value?.length >= el?.minLength) return '✓'

    if (typeof value !== 'string') value = value.toString()
    if (value > el.max || value < el.min) return 'Valor inválido'
    else if (value.match(el.pattern) === null) return '✘'
    else if (el.pattern && value.match(el.pattern) !== null) return '✓'
    else return ' '
}
