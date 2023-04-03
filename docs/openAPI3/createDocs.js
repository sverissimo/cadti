//@ts-check
const yaml = require('js-yaml');
const fs = require('fs');

const { getOpenApiDocs } = require('./p2o.js')
const { updateJson } = require('./getSchemas');

const postmanCollection = './cadTI_api_v4.json'
const outputFile = './docs_v4.yml'

    ; (async function createDocs() {
        const rawYamlDocs = await getOpenApiDocs(postmanCollection)
        const rawDocs = yaml.load(rawYamlDocs);
        const formattedDocs = updateJson(rawDocs)
        const cadTIDocs = yaml.dump(formattedDocs)

        fs.writeFileSync(outputFile, cadTIDocs, 'utf8');
    }());
