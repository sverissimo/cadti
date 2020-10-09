const segurosModel = require("../../mongo/models/segurosModel")

//Essa função marca como atualizado os seguros temporários no MongoDB para evitar que sejam atualizados os mesmos diariamente
const markAsUpdated = async apolice => {
    const
        filter = { apolice },
        update = { situacao: 'Atualizado' },
        t = await segurosModel.findOneAndUpdate(filter, update, { new: true })

    console.log('markUpdated concluded', apolice)
}

module.exports = markAsUpdated 