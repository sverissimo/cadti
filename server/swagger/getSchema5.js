//@ts-check
const fs = require('fs');
const jsonSnippet = require('./postmanSwagger.json')

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
            // loop through the parameters
            for (const parameter of operation.parameters || []) {
                if (parameter.example) {
                    parameter.schema = parameter.schema || {};
                    parameter.schema.example = parameter.example;
                    delete parameter.example;
                }
            }
            // loop through the response headers
            for (const responseCode in operation.responses) {
                const response = operation.responses[responseCode];
                for (const headerName in response.headers || {}) {
                    const header = response.headers[headerName];
                    if (header.example) {
                        header.schema = header.schema || {};
                        header.schema.example = header.example;
                        delete header.example;
                    }
                }
            }
            // loop through the response bodies
            for (const responseCode in operation.responses) {
                const response = operation.responses[responseCode];
                for (const contentType in response.content || {}) {
                    const mediaType = response.content[contentType];
                    if (mediaType.example) {
                        mediaType.schema = mediaType.schema || {};
                        mediaType.schema.example = mediaType.example;
                        delete mediaType.example;
                    }
                    if (mediaType.schema && mediaType.schema.example) {
                        const example = mediaType.schema.example;
                        delete mediaType.schema.example;
                        mediaType.schema.properties = getProperties(example);
                    }
                }
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
        if (Array.isArray(value)) {
            const arrayDataType = getArrayDataType(value);
            if (arrayDataType === "object") {
                properties[field] = {
                    type: "array",
                    items: {
                        type: arrayDataType,
                        properties: getProperties(value[0])
                    }
                };
            } else {
                properties[field] = {
                    type: "array",
                    items: {
                        type: arrayDataType
                    }
                };
            }
        } else if (dataType === "object") {
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

function getArrayDataType(array) {
    // loop through the array to determine the data type of the elements
    for (const element of array) {
        const dataType = typeof element;
        if (dataType === "object") {
            return dataType;
        } else if (dataType !== "undefined") {
            return dataType;
        }
    }
    // if all elements are undefined, return string as the data type
    return "string";
}

const updatedJson = updateJson(jsonSnippet);
fs.writeFileSync('newTest_v7.json', JSON.stringify(updatedJson));
