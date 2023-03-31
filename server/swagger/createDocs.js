//@ts-check
const yaml = require('js-yaml');
const fs = require('fs');

const { getOpenApiDocs } = require('./p2o.js')
const { updateJson } = require('./getSchemas');

const postmanCollection = './cadTI_api_v3.json'
const outputFile = './docs_v3.yml'

    ; (async function createDocs() {
        const rawYamlDocs = await getOpenApiDocs(postmanCollection)
        const rawDocs = yaml.load(rawYamlDocs);
        const formattedDocs = updateJson(rawDocs)
        const cadTIDocs = yaml.dump(formattedDocs)

        fs.writeFileSync(outputFile, cadTIDocs, 'utf8');
    }());
