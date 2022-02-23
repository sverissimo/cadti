const parseRequestBody = (body) => {

    if (body instanceof (Array)) {
        const
            uniqueKeys = new Set()
            , values = []

        body.forEach(obj => {
            Object.keys(obj).forEach(k => uniqueKeys.add(k))
        })

        const keys = Array.from(uniqueKeys)

        body.forEach((obj) => {
            const objValues = keys.map(k => obj[k] ? obj[k] : null)
            values.push(objValues)
        })

        if (keys[0] && values[0]) {
            const result = { keys, values }
            return result
        }


    } else {
        let values = []
            , keys = Object.keys(body)
        keys = keys.filter(k => body[k]).toString()

        Object.entries(body).forEach(([k, v]) => {
            if (!v)
                if (v instanceof Array)
                    v = JSON.stringify(v)
            if (v)
                values.push(('\'' + v + '\''))
        })
        values = values.toString().replace(/'\['/g, '').replace(/'\]'/g, '')
        return { keys, values }
    }
}

module.exports = { parseRequestBody }