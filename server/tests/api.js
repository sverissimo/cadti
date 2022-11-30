//@ts-check
const { testHeaders } = require('./testConfig');
const http = require('http');

/**
 * @param{string} url
 *  @return{Promise<{data:object, status:number|undefined}>} */
const getData = url => new Promise((resolve, reject) => {

    const options = {
        host: 'localhost',
        port: 3001,
        path: url,
        headers: {
            ...testHeaders
        }
    }
    let data = ''

    http.get(options, res => {
        if (res.statusCode !== 200) {
            console.error(`Error Code: ${res.statusCode} \n Error Message: ${res.statusMessage}`);
            res.resume();
            return;
        }
        res.on('data', chunk => data += chunk)
        res.on('error', err => reject(err))
        res.on('end', () => resolve({ data: JSON.parse(data), status: res.statusCode }))
    })
})

module.exports = { getData }