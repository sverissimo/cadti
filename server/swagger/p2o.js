const postmanToOpenApi = require('postman-to-openapi')

const postmanCollection = './cadTI_api_v1.json'
const outputFile = './collection.yml'

    ; (async function () {
        try {
            const result = await postmanToOpenApi(postmanCollection, outputFile, { defaultTag: 'General' })
            console.log(`OpenAPI specs: ${typeof result}`)
        } catch (err) {
            console.log(err)
        }
    }())
