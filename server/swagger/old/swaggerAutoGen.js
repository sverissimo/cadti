//@ts-check
const options = {
    openapi: '3.0.0',
    language: 'pt-BR'
}

const swaggerAutogen = require('swagger-autogen')(options);

const doc = {
    info: {
        version: '',      // by default: '1.0.0'
        title: 'CadTI API',        // by default: 'REST API'
        description: 'API do Cadastro do Transporte Intermunicipal - SEINFRA/MG',  // by default: ''
    },
    host: 'localhost:3000',      // by default: 'localhost:3000'
    basePath: '/',  // by default: '/'
    schemes: [],   // by default: ['http']
    consumes: [],  // by default: ['application/json']
    produces: [],  // by default: ['application/json']
    tags: [        // by default: empty Array
        {
            name: '',         // Tag name
            description: '',  // Tag description
        },
        // { ... }
    ],
    securityDefinitions: {},  // by default: empty object
    definitions: {},          // by default: empty object (Swagger 2.0)
    components: {}            // by default: empty object (OpenAPI 3.x)
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/socioRoutes.js'];

/* NOTE: if you use the express Router, you must pass in the
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */


swaggerAutogen(outputFile, endpointsFiles, doc);