export const formatDate = (date, min) => {

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

export const formatMoney = (value = '') => {
    let v = value.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    return v
}


export const formatCpf = (input) => {
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

/* export const formatCnpj = (input) => {
    if (!input) return
    return input.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5");
} */

export function formatCnpj(input) {

    const tecla = k => k.keyCode;
    document.addEventListener('keypress', tecla)

    let
        tam,
        vr = input.toString()

    vr = vr.replace(".", "");
    vr = vr.replace("/", "");
    vr = vr.replace("-", "");
    tam = vr.length + 1;
    if (tecla !== 14) {
        if (tam === 3)
            input = vr.substr(0, 2) + '.';
        if (tam === 6)
            input = vr.substr(0, 2) + '.' + vr.substr(2, 5) + '.';
        if (tam === 10)
            input = vr.substr(0, 2) + '.' + vr.substr(2, 3) + '.' + vr.substr(6, 3) + '/';
        if (tam === 15)
            input = vr.substr(0, 2) + '.' + vr.substr(2, 3) + '.' + vr.substr(6, 3) + '/' + vr.substr(9, 4) + '-' + vr.substr(13, 2);
    }
    return input
}

export function clearFormat(input) {
    if (!input) return
    else return input.replace(/(\.|\/|-)/g, "");
}

export function formatPhone(phone) {
    if (!phone) return

    phone = phone
        .replace(/(?!\d)./g, '')
        .replace(/(\d{2})/, '($1) ')
    if (phone.length === 13) phone = phone.replace(/(\d{4})(\d)/, '$1-$2')
    if (phone.length === 14) phone = phone.replace(/(\d{5})(\d)/, '$1-$2')

    return phone
}

export function formatShare(number) {
    if (!number) return

    /* if ((number.length === 4 && number.charAt(3) === '0')) {
        console.log(typeof number, number)
        return number
    } else if (number.length === 5 && number.charAt(4) === '0') {
        console.log(typeof number, number, 'ha')
        return number
    }
 */

    /*   if (number.length > 1 && number.search(',') !== -1)
          return number
      if (number.length >= 5) {
          number = Number(number)
          number = +(number.toPrecision(4))
      } */
    if (number.length >= 5)
        number = number.slice(0, 5)
    return number
}