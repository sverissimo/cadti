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
            if (operation.responses) {
                for (const statusCode in operation.responses) {
                    const response = operation.responses[statusCode];
                    if (response.content) {
                        for (const mimeType in response.content) {
                            const responseSchema = response.content[mimeType].schema;
                            const responseExample = response.content[mimeType].example;
                            delete response.content[mimeType].example;
                            if (responseSchema && responseExample) {
                                responseSchema.properties = getProperties(responseExample);
                            }
                        }
                    }
                }
            }
            if (operation.parameters) {
                for (const parameter of operation.parameters) {
                    if (parameter.schema && parameter.example) {
                        parameter.schema.properties = getProperties(parameter.example);
                    }
                }
            }
        }
    }
    return json;
}

function getProperties(example) {
    const properties = {};
    // handle arrays
    if (Array.isArray(example)) {
        // determine the data type of the array elements
        const arrayDataType = getArrayDataType(example);
        // describe the array
        properties.type = "array";
        properties.items = {};
        // if the elements are objects, describe their properties
        if (arrayDataType === "object") {
            properties.items.type = "object";
            properties.items.properties = getProperties(example[0]);
        } else {
            properties.items.type = arrayDataType;
        }
    } else if (typeof example === "object") {
        // handle objects
        for (const field in example) {
            const value = example[field];
            const dataType = typeof value;
            if (Array.isArray(value)) {
                // describe arrays within the object
                properties[field] = {
                    type: "array",
                    items: {
                        type: getArrayDataType(value)
                    }
                };
            } else if (dataType === "object") {
                // describe nested objects
                properties[field] = {
                    type: dataType,
                    properties: getProperties(value)
                };
            } else {
                // describe simple data types
                properties[field] = {
                    type: dataType
                };
            }
        }
    } else {
        // describe simple data types
        properties.type = typeof example;
    }
    return properties;
}

function getArrayDataType(array) {
    // determine the data type of the array elements
    const uniqueTypes = new Set(array.map(element => typeof element));
    if (uniqueTypes.size === 1) {
        return uniqueTypes.values().next().value;
    } else {
        return "object";
    }
}

const updatedJson = updateJson(jsonSnippet);
fs.writeFileSync('newTest_v8.json', JSON.stringify(updatedJson));
