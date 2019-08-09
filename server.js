const express = require('express')
const app = express()
const pg = require('pg')

const HOST = '0.0.0.0'
const PORT = 80;

app.get('/', (req, res)=> res.status(200).send('alright, man!'))

app.listen(PORT, HOST)

console.log('Running on port 4000, dude...')
