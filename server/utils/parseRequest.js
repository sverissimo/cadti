const parseRequestBody = (body) => {

    if (body instanceof (Array)) {
        const uniqueKeys = new Set()
        const values = []

        body.forEach(obj => {
            Object.keys(obj).forEach(k => uniqueKeys.add(k))
        })

        const keys = [...uniqueKeys]

        body.forEach((obj) => {
            const objValues = keys.map(k => obj[k] ? obj[k] : null)
            values.push(objValues)
        })

        if (keys[0] && values[0]) {
            const result = { keys, values }
            return result
        }
    } else {
        let values = [];
        let keys = Object.keys(body);

        keys = keys.filter(k => body[k]).toString()

        Object.entries(body).forEach(([k, v]) => {
            if (v instanceof Array) {
                if (k === 'equipamentos_id' || key === 'acessibilidade_id')
                    v = `'${JSON.stringify(v)}'::json`
                if (k === 'empresas')
                    v = `array${JSON.stringify(v)}`
            }
            else
                v = `'${v}'`

            values.push(v)
        })
        values = values.toString().replace(/'\['/g, '').replace(/'\]'/g, '')
        return { keys, values }
    }
}

module.exports = { parseRequestBody }