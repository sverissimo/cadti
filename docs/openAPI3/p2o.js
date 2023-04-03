const postmanToOpenApi = require('postman-to-openapi')

const postmanCollection = './cadTI_api_v1.json'
const outputFile = './docsRaw_v2.yml'

async function getOpenApiDocs(postmanCollection) {
    try {
        //const result = await postmanToOpenApi(postmanCollection, outputFile, { defaultTag: 'General' })
        const result = await postmanToOpenApi(postmanCollection)
        return result
    } catch (err) {
        console.log(err)
    }
}

module.exports = { getOpenApiDocs }