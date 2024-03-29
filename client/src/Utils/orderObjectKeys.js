//@ts-check

import { vehicleFieldsOrder, seguroFieldsOrder, empresaFieldsOrder, procuradorFieldsOrder, sociosFieldsOrder } from "../Consultas/fieldsOrder"

/**
 * @param {string} subject
 * @param {Object[]} rawData 
 * @returns any
 */
const orderObjectKeys = (subject, rawData) => {

    let keys

    if (subject === 'empresas') {
        keys = empresaFieldsOrder
    }
    else if (subject === 'socios' || subject === 'sócios') {
        keys = sociosFieldsOrder
    }
    else if (subject === 'procuradores') {
        keys = procuradorFieldsOrder
    }
    else if (subject === 'veículos' && rawData[0].veiculoId) {
        keys = vehicleFieldsOrder
    }
    else if (subject === 'seguros')
        keys = seguroFieldsOrder
    else
        return rawData
    const orderedArray = []

    rawData.forEach(obj => {
        let tempObj = {}
        keys.forEach(key => {
            if (!tempObj[key])
                tempObj[key] = obj[key]
        })
        orderedArray.push(tempObj)
        tempObj = {}
    })


    return orderedArray
}

export default orderObjectKeys
