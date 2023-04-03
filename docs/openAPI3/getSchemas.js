//@ts-check
const aboutDocs = require('./aboutDocs');

function updateJson(json) {
    json.info.description = aboutDocs
    json.info.version = '3.1.2'
    // Loop through the paths
    for (const path in json.paths) {
        const methods = json.paths[path];

        // Loop through the HTTP methods
        for (const method in methods) {
            const operation = methods[method];

            if (operation.responses && operation.responses['200'] && operation.responses['200'].content['application/json'] && operation.responses['200'].content['application/json'].example) {
                const { schema, example } = operation.responses['200'].content['application/json']
                if (Array.isArray(example)) {
                    schema.type = 'array'
                    schema.items = getProperties(example);
                } else {
                    delete schema.example;
                    schema.properties = getProperties(example);
                }
                delete operation.responses['200'].headers
                delete operation.responses['200'].content['application/json'].example
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

    if (Array.isArray(example)) {
        const arrayDataType = getArrayDataType(example);
        if (arrayDataType === 'object') {
            const items = {
                type: 'object',
                properties: getProperties(example[0])
            }
            return items
        }
    }

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
            const format = field.match(/vencimento|validade|created_at|updated_at/) ? 'date' : undefined
            properties[field] = {
                type: dataType,
                format
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

module.exports = { updateJson };
