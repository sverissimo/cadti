//@ts-check
/**
 * @typedef {object} parsedBody
 * @property {string|string[]} keys
 * @property {string|string[]} values
 *  @returns {parsedBody} */
const parseRequestBody = (body) => {
    if (body instanceof (Array)) {
        const uniqueKeys = new Set()
        const values = []
        body.forEach(obj => {
            Object.keys(obj)
                .forEach(k => uniqueKeys.add(k))
        })
        const keys = [...uniqueKeys]

        body.forEach((obj) => {
            const objValues = keys.map(k => obj[k] ? obj[k] : null)
            values.push(objValues)
        })

        const result = { keys, values }
        return result

    } else {
        const keys = Object.keys(body)
            .filter(k => !!body[k])
            .join()
        const valuesArray = [];

        Object.entries(body).forEach(([k, v]) => {
            if (Array.isArray(v)) {
                if (k === 'equipamentos_id' || k === 'acessibilidade_id') {
                    v = `'${JSON.stringify(v)}'::json`
                }
                if (k === 'empresas') {
                    v = `array${JSON.stringify(v)}`
                }
            } else {
                v = `'${v}'`
            }
            valuesArray.push(v)
        })

        const values = String(valuesArray)
            .replace(/'\['/g, '')
            .replace(/'\]'/g, '')
        return { keys, values }
    }
}

module.exports = { parseRequestBody }