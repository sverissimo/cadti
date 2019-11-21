const parseRequestBody = (body) => {

    if (body instanceof (Array)) {
        let parsedArray = []


        body.forEach(obj => {
            const keys = Object.keys(obj).toString(),
                initValues = Object.values(obj)
            let values = []

            initValues.forEach(v => {
                console.log(v, '*************', values, Array.isArray(values))
                values.push(('\'' + v + '\'').toString())                
            })
            values = values.toString().replace(/'\['/g, '').replace(/'\]'/g, '')
            parsedArray.push({ keys, values })
        })
        console.log('*************', parsedArray)
        return parsedArray


    } else {
        let values = []
        const keys = Object.keys(body).toString(),
            initValues = Object.values(body)
        initValues.forEach(v => {
            values.push(('\'' + v + '\'').toString())
        })
        values = values.toString().replace(/'\['/g, '').replace(/'\]'/g, '')
        return { keys, values }
    }


}

module.exports = { parseRequestBody }