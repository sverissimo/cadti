import moment from 'moment'

export const sum = array => {
    if (!array.length) {
        return 0
    }
    const sum = array.reduce((a, b) => {
        const n1 = Number(a) || 0
        const n2 = Number(b) || 0
        return n1 + n2
    })
    return sum
}

export const average = array => {
    if (!array.length) {
        return 0
    }

    const total = sum(array)
    const average = total / array.length
    return average.toFixed(2)
}

export const countExpired = vehicles => {
    return vehicles
        .filter(r => !r.vencimento
            || (moment(r.vencimento).isValid()
                && moment(r.vencimento).isBefore(moment(), 'day')
                && r.veiculoId
                && r)
        ).length
}
