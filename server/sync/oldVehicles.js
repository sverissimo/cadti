const
    fs = require('fs'),
    oldVehiclesModel = require('../mongo/models/oldVehiclesModel')


const oldVehicles = (req, res) => {
    const { body } = req

    /*fs.writeFile('oldVehicles.json', oldVehiclesData, 'utf8', (err) => console.log(err))
     let a = fs.readFileSync('oldVehicles.json', 'utf8', (err) => console.log(err))
     console.log(a)
 */
    oldVehiclesModel.insertMany(body, (err, doc) => {
        if (err) console.log(err)
        console.log(typeof doc)
        //fs.writeFile('oldVehiclesDB.json', doc, 'utf8', (err) => console.log(err))
        console.log('file written alright.')
        res.send('Real deal... whatever, dude.')
    })
}

const getOldVehicle = async (req, res) => {
    const
        { placa } = req.query,
        query = { Placa: placa },
        result = await oldVehiclesModel.find(query).exec()

    res.send(result)
}

module.exports = { oldVehicles, getOldVehicle }