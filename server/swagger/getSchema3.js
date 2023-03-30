//@ts-check
const fs = require('fs');
const jsonSnippet = require('./jsonSnippet2.json')

function updateJson(json) {
    // loop through the paths
    for (const path in json.paths) {
        const methods = json.paths[path];
        // loop through the HTTP methods
        for (const method in methods) {
            const operation = methods[method];
            if (operation.requestBody && operation.requestBody.content["application/json"]) {
                const schema = operation.requestBody.content["application/json"].schema;
                const example = schema.example;
                delete schema.example;
                schema.properties = getProperties(example);
            }
        }
    }
    return json;
}

function getProperties(example) {
    const properties = {};
    // loop through the fields in the example and get their data type
    for (const field in example) {
        const value = example[field];
        const dataType = typeof value;
        if (dataType === "object") {
            properties[field] = {
                type: dataType,
                properties: getProperties(value)
            };
        } else {
            properties[field] = {
                type: dataType
            };
        }
    }
    return properties;
}

const updatedJson = updateJson(jsonSnippet);
fs.writeFileSync('newTest_v3.json', JSON.stringify(updatedJson));