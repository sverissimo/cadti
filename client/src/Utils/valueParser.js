import { formatCpf, formatCnpj, formatPhone, formatShare } from './formatValues'

export default function valueParser(name, value) {
    let parsed

    if (name.match('cnpj')) {
        parsed = formatCnpj(value)
        return parsed
    }
    if (name.match('cpf')) {
        parsed = formatCpf(value)
        return parsed
    }
    if (name.match('tel')) {
        parsed = formatPhone(value)
        return parsed
    }
    if (name.match('share')) {
        parsed = formatShare(value)
        return parsed
    }

    else return value
}
