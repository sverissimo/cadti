const
    mongoose = require('mongoose'),
    oldVehiclesSchema = new mongoose.Schema({ any: {} }, { strict: false }),
    oldVehiclesModel = mongoose.model('oldVehicles', oldVehiclesSchema, 'oldVehicles')

module.exports = oldVehiclesModel