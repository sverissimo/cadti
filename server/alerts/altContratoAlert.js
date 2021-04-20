//@ts-check
const
    moment = require('moment')
    , sendMail = require('../mail/sendMail')


/**
 * Ao se cadastrar altContratual, essa função verifica se foi registrado no cadTI em 10 dias a contar do prazo do registro da Junta, para emitir alerta casoi positivo.
 * @param { object} doc - Objeto contendo data de registro na junta comercial e data de registro no sistema
 */
const altContratoAlert = doc => {

    let { dataJunta, createdAt, codigoEmpresa, razaoSocial } = doc
    console.log("🚀 ~ file: altContratoAlert.js ~ line 14 ~ doc", doc)
    const
        to = 'sverissimo2@gmail.com',
        subject = `Penalidade aplicável para o delegatário ${razaoSocial}.`,
        vocativo = `Equipe DGTI`,
        message = `O registro na Junta Comercial realizado pelo delegatário ${razaoSocial} (código ${codigoEmpresa}) supera 10 dias registro no sistema, sendo este passível de aplicação de penalidade prevista no regulamento.`


    if (dataJunta && createdAt) {
        dataJunta = moment(dataJunta)
        createdAt = moment(createdAt)

        const diff = createdAt.diff(dataJunta, 'days')
        if (diff > 10) {
            sendMail({ to, subject, vocativo, message })
            console.log("Penalidade aplicável, registro na junta supera 10 dias registro no sistema: ", diff)
        }
        else
            console.log('Nenhuma penalidade aplicada. Registro no sistema está dentro do prazo de 10 dias do registro da junta: ', diff)
    }
}

module.exports = altContratoAlert