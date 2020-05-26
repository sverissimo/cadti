import { formatCpf, formatCnpj } from './formatValues'

export default function valueParser(name, value) {

    if (name === 'cpfSocio') {
        const parsed = formatCpf(value)        
        return parsed
    }
    else return value
}