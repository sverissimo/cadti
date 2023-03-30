//@ts-check
const fs = require('fs');
const yaml = require('js-yaml')
const jsonSnippet = require('./jsonSnippet2.json')

function getObjectSchema(jsonObj) {
    const schema = {};
    //const jsonObj = swaggerSpecs.paths
    // Loop through all properties in the JSON object
    for (const prop in jsonObj) {
        // If the property is an object and has a "type" property equal to "object"
        if (typeof jsonObj[prop] == "object" && jsonObj[prop].type == "object") {
            // Get the object type from the "example" property
            const objectType = typeof jsonObj[prop].example;
            // Add the objectType property as a sibling of the "type" property
            jsonObj[prop].objectType = objectType;
            // If the object has an example, create a schema describing its properties
            if (jsonObj[prop].example) {
                schema[objectType] = {};
                // Loop through all properties in the example object
                for (const subProp in jsonObj[prop].example) {
                    // Add the property to the schema with its type
                    const type = typeof jsonObj[prop].example[subProp];
                    schema[objectType][subProp] = type;
                }
            }
            jsonObj[prop].type = schema[objectType]
        }
        // If the property is an object, recursively call the function on it
        if (typeof jsonObj[prop] == "object") {
            const subSchema = getObjectSchema(jsonObj[prop]);
            // Merge the sub-schema into the main schema
            for (const subProp in subSchema) {
                schema[subProp] = subSchema[subProp];
            }
        }
    }
    // Return the schema
    //return schema;
    return jsonObj;
}

const schema = getObjectSchema(jsonSnippet);
const fileContent = yaml.dump(schema)
fs.writeFileSync('mfker.yml', fileContent);
//console.log("🚀 ~ file: getSchema.js:39 ~ schema:", schema.paths['/api/altContrato'].post)
//console.log("🚀 ~ file: getSchema.js:39 ~ schema:", JSON.stringify(schema))
/* for (const tag in schema.object) {
    console.log({ [tag]: schema.object[tag] });
} */