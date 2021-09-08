const
    mongoose = require('mongoose'),
    prazosAlertaSchema = new mongoose.Schema({
        prazoAlertaLaudo: { type: [], default: [1, 7, 15, 30] },
        prazoAlertaProcuracao: { type: [], default: [1, 7, 15, 30] },
        prazoAlertaSeguro: { type: [], default: [1, 7, 15, 30] }
    }, { _id: false, id: false, strict: false })

module.exports = prazosAlertaSchema