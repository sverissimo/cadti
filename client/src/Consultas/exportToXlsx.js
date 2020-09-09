import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import moment from 'moment'

const exportToXlsx = (subject, tab, form, rawData) => {
    const
        fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
        fileExtension = '.xlsx',
        fileName = subject[tab]

    const formatedData = formatData(form, rawData)

    const ws = XLSX.utils.json_to_sheet(formatedData);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
}

function formatData(form, data) {

    const rawData = JSON.parse(JSON.stringify(data))

    const formatValue = value => {
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