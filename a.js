const axios = require("axios");

axios.get('http://localhost:3001/api/parametros')
    .then(r => console.log(r))