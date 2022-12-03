const { parseRequestBody } = require("../utils/parseRequest")
const procPayload = require("./mockData/procPayload")

test('Test parseRequestBody util function', () => {

    const result = parseRequestBody([procPayload])
    console.log("🚀 ~ file: parseRequestBody.test.js:7 ~ test ~ result", result)

})