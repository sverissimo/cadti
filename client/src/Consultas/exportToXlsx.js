import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import moment from 'moment'
import orderObjectKeys from '../Utils/orderObjectKeys';

const exportToXlsx = (subject, form, rd) => {
    //Demanda da DGTI de reordenar colunas da tabela veículos
    const rawData = orderObjectKeys(subject, rd) || rd

    const
        fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
        fileExtension = '.xlsx',
        fileName = subject

    const formatedData = formatData(form, rawData)

    const
        ws = XLSX.utils.json_to_sheet(formatedData)
        , widths = fitToColumn(formatedData)

    ws['!cols'] = widths.map(w => ({ wch: w }))
    //console.log(fitToColumn(formatedData))

    //Obtém o cumprimento máximo dos valores das células para formatar o arquivo de excel
    function fitToColumn(formatedData) {
        const
            numberOfColumns = Object.keys(formatedData[0]).length
            , widths = new Array(numberOfColumns)

        formatedData.forEach(obj => {
            Object.values(obj).forEach((v, i) => {
                /* let width = v ? v.toString().length : 7
                width > 50 ? width = 50 : void 0
                width < 5 ? width = 5 : void 0
                if (!widths[i] || width > widths[i])
                    widths[i] = width */
                let width = v ? v.toString().length : 1
                if (!widths[i])
                    widths[i] = width
                else
                    widths[i] += width
            });
        })
        const w = widths.map(w => {
            const average = Math.ceil(w / formatedData.length) + 2
            if (average < 7)
                return 7
            else
                return average
        })
        //console.log("🚀 ~ file: exportToXlsx.js ~ line 45 ~ fitToColumn ~ w", w)
        return w
    }

    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
}

function formatData(form, data) {

    const rawData = JSON.parse(JSON.stringify(data))

    const formatValue = value => {
        if (value instanceof Array)
            value = value.toString()
        if (moment(value, 'YYYY-MM-DDTHH:mm:ss.SSSZZ', true).isValid())
            value = moment(value).format('DD/MM/YYYY')
        return value
    }

    if (Array.isArray(rawData)) {
        rawData.forEach((obj, i) => {
            Object.entries(obj).forEach(([key, value]) => {

                const formField = form.find(f => f.field === key)

                if (!formField) {
                    delete obj[key]
                    return

                } else {
                    const header = formField?.label
                    value = formatValue(value)
                    obj[header] = value
                    delete obj[key]
                }
            })
        })
    }
    return rawData
}

export default exportToXlsx