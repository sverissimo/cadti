//@ts-check
const { defaultOptions, testHeaders } = require('./testConfig')
const http = require('http')

/**
 * @param{string} url
 * @return{Promise<{data:object, status:number|undefined}>} */
const getData = url => new Promise((resolve, reject) => {
    const options = {
        ...defaultOptions,
        path: url,
    }

    let data = ''
    http.get(options, res => {
        if (res.statusCode !== 200) {
            console.error(`Error Code: ${res.statusCode} \n Error Message: ${res.statusMessage}`)
            res.resume()
            return
        }
        res.on('data', chunk => data += chunk)
        res.on('error', err => reject(err))
        res.on('end', () => resolve({ data: JSON.parse(data), status: res.statusCode }))
    })
})

const fetch = async (url) => {
    const result = await getData(url)

    if (!Array.isArray(result.data))
        return result.data

    result.data.forEach(obj => {
        if (typeof obj === 'object') {
            Object.entries(obj).forEach(([k, v]) => {
                if (typeof v === 'string' && v.match(/\[/)) {
                    obj[k] = JSON.parse(v)
                }
            })
        }
    })
    return result.data
}

const post = (url, data) => new Promise((resolve, reject) => {
    const options = {
        host: 'localhost',
        port: 3001,
        path: url,
        method: 'POST',
        headers: {
            ...testHeaders,
            'Content-Type': 'application/json',
            //'Content-Length': Buffer.byteLength(data),
        }
    }
    let responseData = ''
    const req = http.request(options, (res) => {
        res.setEncoding('utf8')
        res.on('data', chunk => responseData += chunk)
        res.on('end', () => resolve(responseData))
    })

    req.on('error', (e) => {
        console.error(`### Error on request object: ${e.message}`)
        reject(e)
    })
    req.write(JSON.stringify(data))
    req.end()
})

/**
 * @param{string} url
 * @return{Promise<{status:number|undefined}>} */
const deleteOne = (url) => new Promise((resolve, reject) => {
    const options = {
        ...defaultOptions,
        path: url,
        method: 'DELETE',
        headers: {
            ...testHeaders,
            'Content-Type': 'application/json'
        }
    }
    let responseData
    const req = http.request(options, res => {
        if (res.statusCode && res.statusCode > 217) {
            console.error(`Error Code: ${res.statusCode} \n Error Message: ${res.statusMessage}`)
            res.resume()
            return
        }
        res.on('error', err => reject(err))
        res.on('data', chunk => responseData += chunk)
        res.on('end', () => resolve({ status: res.statusCode }))
    })
    req.end()
})

module.exports = { testApi: { getData, fetch, post, deleteOne } }