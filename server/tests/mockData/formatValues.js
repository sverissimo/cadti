exports.formatCpf = (input) => {
    if (!input) return
    else {
        input = input
            .replace(/\D/g, '') // substitui qualquer caracter que nao seja numero por nada
            .replace(/(\d{3})(\d)/, '$1.$2') // captura 2 grupos de numero o primeiro de 3 e o segundo de 1, apos capturar o primeiro grupo ele adiciona um ponto antes do segundo grupo de numero
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1') // captura 2 numeros seguidos de um traço e não deixa ser digitado mais nada
    }
    return input
}

exports.formatCnpj = (input) => {
    if (!input) return
    return input.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5");
}

exports.formatDate = (date, min) => {
    const minutes = () => {
        if (new Date(date).getMinutes() < 10) {
            return '0' + new Date(date).getMinutes()
        } else {
            return new Date(date).getMinutes()
        }
    }

    if (/\d/.test(date)) {
        let data = new Date(date).getDate() + '/' + (new Date(date).getMonth() + 1) + '/' + new Date(date).getFullYear()// + ', ' + new Date(date).getHours() + ':' + minutes() + 'h'
        if (min) data += ', ' + new Date(date).getHours() + ':' + minutes() + 'h'
        return data.toString()
    } else {
        return date
    }
}

exports.formatMoney = (value = '') => {
    let v = value.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    return v
}
