//@ts-check
const fs = require('fs');
const jsonSnippet = require('./postmanSwagger.json')

function updateJson(json) {
    // Loop through the paths
    for (const path in json.paths) {
        const methods = json.paths[path];

        // Loop through the HTTP methods
        for (const method in methods) {
            const operation = methods[method];

            if (operation.responses && operation.responses['200'] && operation.responses['200'].content['application/json']) {
                const schema = operation.responses['200'].content['application/json'].schema;
                const example = schema.example;
                delete schema.example;
                schema.properties = getProperties(example);
            }

            if (operation.requestBody && operation.requestBody.content['application/json']) {
                const schema = operation.requestBody.content['application/json'].schema;
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

    // Loop through the fields in the example and get their data type
    for (const field in example) {
        const value = example[field];
        const dataType = typeof value;

        if (Array.isArray(value)) {
            const arrayDataType = getArrayDataType(value);

            if (arrayDataType === 'object') {
                properties[field] = {
                    type: 'array',
                    items: {
                        type: arrayDataType,
                        properties: getProperties(value[0])
                    }
                };
            } else {
                properties[field] = {
                    type: 'array',
                    items: {
                        type: arrayDataType
                    }
                };
            }
        } else if (dataType === 'object') {
            properties[field] = {
                type: dataType,
                properties: getProperties(value)
            };
        } else {
            properties[field] = {
                type: dataType
            };
        }

        // Check for nested 'example' props
        if (value && typeof value === 'object' && 'example' in value) {
            const exampleValue = value.example;
            delete value.example;

            if (Array.isArray(exampleValue)) {
                const arrayDataType = getArrayDataType(exampleValue);

                if (arrayDataType === 'object') {
                    value.properties = {
                        type: 'array',
                        items: {
                            type: arrayDataType,
                            properties: getProperties(exampleValue[0])
                        }
                    };
                } else {
                    value.properties = {
                        type: 'array',
                        items: {
                            type: arrayDataType
                        }
                    };
                }
            } else if (typeof exampleValue === 'object') {
                value.properties = {
                    type: 'object',
                    properties: getProperties(exampleValue)
                };
            } else {
                value.type = typeof exampleValue;
            }
        }
    }

    return properties;
}

function getArrayDataType(array) {
    // Loop through the array to determine the data type of the elements
    for (const element of array) {
        const dataType = typeof element;

        if (dataType === 'object') {
            return dataType;
        } else if (dataType !== 'undefined') {
            return dataType;
        }
    }

    // If all elements are undefined, return string as the data type
    return 'string';
}

const updatedJson = updateJson(jsonSnippet);
fs.writeFileSync('newTest_v9.json', JSON.stringify(updatedJson));
