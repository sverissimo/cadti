const postmanToOpenApi = require('postman-to-openapi')

const postmanCollection = './cadTI_api_v1.json'
const outputFile = './collection.yml'

    // Async/await
    ; (async function () {
        try {
            const result = await postmanToOpenApi(postmanCollection, outputFile, { defaultTag: 'General' })
            // Without save the result in a file
            //const result2 = await postmanToOpenApi(postmanCollection, null, { defaultTag: 'General' })
            console.log(`OpenAPI specs: ${result}`)
        } catch (err) {
            console.log(err)
        }
    }())

/*
// Promise callback style
postmanToOpenApi(postmanCollection, outputFile, { defaultTag: 'General' })
    .then(result => {
        console.log(`OpenAPI specs: ${result}`)
    })
    .catch(err => {
        console.log(err)
    }) */