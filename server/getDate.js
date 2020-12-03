const getFormatedDate = () => {
    const
        dateObj = new Date(),
        day = dateObj.getDate().toString(),
        mes = dateObj.getMonth(),
        year = dateObj.getFullYear(),

        months = ['jan', 'fev', 'mar', 'abr', 'maio', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        month = months[mes]

    result = day + month + year
    return result
}

module.exports = getFormatedDate