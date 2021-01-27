const
    mongoose = require('mongoose'),
    nomesSchema = new mongoose.Schema({
        secretaria: {
            type: String,
            trim: true,
            default: 'Secretaria de Estado de Infraestrutura e Mobilidade'
        },
        subsecretaria: {
            type: String,
            trim: true,
            default: 'Subsecretaria de Transportes e Mobilidade'
        },
        superintendencia: {
            type: String,
            trim: true,
            default: 'Superintendência de Transporte Intermunicipal e Metropolitano'
        },
        diretoria: {
            type: String,
            trim: true,
            default: 'Diretoria de Gestão do Transporte Intermunicipal'
        },
        sistema: {
            type: String,
            trim: true,
            default: 'Sistema de Cadastro do Transporte Intermunicipal de Minas Gerais'
        },
        siglaSecretaria: {
            type: String,
            trim: true,
            default: 'SEINFRA'
        },
        siglaSistema: {
            type: String,
            trim: true,
            default: 'CadTI - MG'
        },
    }, { _id: false, id: false, strict: false })

module.exports = nomesSchema