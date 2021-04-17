const moment = require('moment')

const tableGenerator = (tableData, tableHeaders) => {

    let tableString = '', tHeader = '<tr>'

    tableHeaders.forEach(h => {
        tHeader += `<th>${h}</th>`
    });
    tHeader += `</tr>`

    tableData.forEach((el, i) => {
        tableString += `<tr>

        `
        const data = Object.entries(el)
        data.forEach(([k, v]) => {
            if (k === 'vencimento' || k === 'validade')
                v = moment(v).format('DD/MM/YYYY')
            if (v instanceof Array)
                v = v.join().replace(/,/g, ', ')
            tableString += ` <td>${v}</td> `
        })
        tableString += `</tr>
        `
    })

    const table = tHeader + tableString
    return table

}

module.exports = tableGenerator
