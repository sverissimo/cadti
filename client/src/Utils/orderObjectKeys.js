//@ts-check

/**
 * @param {string} subject
 * @param {Object[]} rawData 
 * @returns any
 */
const orderObjectKeys = (subject, rawData) => {
    if (subject !== 'veículos' && !rawData[0].veiculoId)
        return null

    const
        keys = Object.keys(rawData[0])
        , ap = keys.indexOf('apolice')
        , seg = keys.indexOf('seguradora')
        , orderedArray = []

    keys.splice(seg, 0, 'apolice')
    keys.splice(ap, 1)

    console.log("🚀 ~ file: orderObjectKeys.js ~ line 6 ~ orderObjectKeys ~ keys", keys)
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
