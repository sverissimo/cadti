const yaml = require('js-yaml');
const fs = require('fs');

try {
    const doc = yaml.load(fs.readFileSync('./collection.yml', 'utf8'));
    const { paths } = doc
    let i = 0
    const result = {}
    for (const endPoint in paths) {
        const endPointObj = paths[endPoint]
        for (const method in endPointObj) {
            i++
            const target = endPointObj[method]
            const { parameters, responses, requestBody, ...rest } = target
            Object.assign(result, { [i]: rest })

            if (parameters) {
                const param = parameters.find(p => !!p.example) //all params have examples
                //console.log(`\n ${endPoint} - ${method} - parameters: `, param)
            }

            if (responses && responses['200'].content['application/json']) {
                //console.log(`\n ${endPoint} - ${method} - responses: `, responses['200'].content['application/json'])

            }
            if (requestBody && requestBody.content['application/json']) {
                //console.log(`\n ${endPoint} - ${method}: - requestBody:`, requestBody.content['application/json'].schema)
            }

        }
    }
    console.log("🚀 ~ file: parseYamlSwagger.js:9 ~ result:", result)
    const fileContent = yaml.dump(result)
    fs.writeFileSync('newYaml', fileContent)
    /* console.log(Object.keys(paths))
    console.log(i) */
} catch (e) {
    console.log(e);
}