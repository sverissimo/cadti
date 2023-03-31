const jsonSnippet = require('./jsonSnippet.json')

function addObjectTypeProperty(jsonObj) {
    // Loop through all properties in the JSON object
    for (var prop in jsonObj) {
        // If the property is an object and has a "type" property equal to "object"
        if (typeof jsonObj[prop] == "object" && jsonObj[prop].type == "object") {
            // Get the object type from the "example" property
            var objectType = typeof jsonObj[prop].example;
            // Add the objectType property as a sibling of the "type" property
            jsonObj[prop].objectType = objectType;
        }
        // If the property is an object, recursively call the function on it
        if (typeof jsonObj[prop] == "object") {
            addObjectTypeProperty(jsonObj[prop]);
        }
    }
    // Return the modified JSON object
    return jsonObj;
}

var jsonObj = addObjectTypeProperty(jsonSnippet);
console.log(JSON.stringify(jsonObj, null, 2));
