const parseRequestBody = (body) => {
    console.log(body)
    let values = []
    const keys = Object.keys(body).toString(),
        initValues = Object.values(body)
    initValues.forEach(v => {
        values.push(('\'' + v + '\'').toString())
    })
    values = values.toString().replace(/'\['/g, '').replace(/'\]'/g, '')
    return { keys, values }
}

module.exports = { parseRequestBody }