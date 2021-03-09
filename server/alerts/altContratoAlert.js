const moment = require('moment')

//Ao se cadastrar altContratual, essa função verifica se foi registrado no cadTI em 10 dias a contar do prazo do registro da Junta, para emitir alerta casoi positivo.
const altContratoAlert = doc => {

    let { dataJunta, createdAt } = doc

    if (dataJunta && createdAt) {
        dataJunta = moment(dataJunta)
        createdAt = moment(createdAt)

        const diff = createdAt.diff(dataJunta, 'days')
        if (diff > 10)
            console.log("Penalidade aplicável, registro na junta supera 10 dias registro no sistema: ", diff)
        else
            console.log('Nenhuma penalidade aplicada. Registro no sistema está dentro do prazo de 10 dias do registro da junta: ', diff)
    }
}

module.exports = altContratoAlert