const parseRequestBody = (body) => {

    if (body instanceof (Array)) {
        let parsedArray = []

        body.forEach((obj) => {

            let values = [], keys = []

            Object.entries(obj).forEach(([k, v]) => {
                if (v) {
                    values.push(('\'' + v + '\'').toString())
                    keys.push(k.toString())
                }
            })

            values = values.toString().replace(/'\['/g, '').replace(/'\]'/g, '')

            if (keys[0] && values[0]) parsedArray.push({ keys, values })
        })
        return parsedArray

    } else {
        let values = []
        const keys = Object.keys(body).toString()

        Object.entries(body).forEach(([k, v]) => {
            if (v instanceof Array)
                v = JSON.stringify(v)
            if (v)
                values.push(('\'' + v + '\'').toString())
        })
        values = values.toString().replace(/'\['/g, '').replace(/'\]'/g, '')
        return { keys, values }
    }
}

module.exports = { parseRequestBody }